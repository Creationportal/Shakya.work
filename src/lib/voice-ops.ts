/**
 * voice-ops.ts — the calculation engine behind the /voiceops calculator.
 *
 * Pure functions, no I/O, no dependencies: the whole tool runs client-side and
 * costs nothing to operate, which is the same "free path first" rule the rest
 * of the lab follows.
 *
 * Every rate in VoiceOpsInput is a user-editable default. The model is
 * deliberately simple arithmetic that an operator can audit in their head —
 * the value is in making the trade-offs visible, not in pretending to be a
 * vendor pricing engine.
 */

export type RegionShare = { name: string; share: number };

export type VoiceOpsInput = {
  callsPerMonth: number;
  avgMinutes: number;
  peakConcurrent: number;
  provisioned: number;
  asrRatePerMin: number;
  llmCostPerCall: number;
  ttsCharsPerCall: number;
  ttsRatePer1kChars: number;
  telephonyRatePerMin: number;
  asrMs: number;
  llmMs: number;
  ttsMs: number;
  networkMs: number;
  regions: RegionShare[];
};

export type LineItem = {
  key: "asr" | "llm" | "tts" | "telephony";
  usage: number;
  unit: "min" | "call" | "1k-chars";
  rate: number;
  cost: number;
};

export type LatencyVerdict = "excellent" | "acceptable" | "risky" | "poor";
export type CapacityVerdict = "over" | "thin" | "healthy" | "idle";

export type VoiceOpsResult = {
  minutes: number;
  items: LineItem[];
  total: number;
  costPerCall: number;
  costPerMinute: number;
  latency: {
    segments: { key: "asr" | "llm" | "tts" | "network"; ms: number }[];
    total: number;
    verdict: LatencyVerdict;
  };
  capacity: {
    utilization: number;
    headroom: number;
    verdict: CapacityVerdict;
  };
  regionLoad: { name: string; concurrent: number }[];
};

export const DEFAULTS: VoiceOpsInput = {
  callsPerMonth: 120_000,
  avgMinutes: 3.5,
  peakConcurrent: 2_000,
  provisioned: 3_500,
  asrRatePerMin: 0.005,
  llmCostPerCall: 0.01,
  ttsCharsPerCall: 900,
  ttsRatePer1kChars: 0.015,
  telephonyRatePerMin: 0.013,
  asrMs: 320,
  llmMs: 600,
  ttsMs: 380,
  networkMs: 180,
  regions: [
    { name: "Saudi", share: 25 },
    { name: "Huawei", share: 20 },
    { name: "Japan", share: 10 },
    { name: "US", share: 20 },
    { name: "Singapore", share: 15 },
    { name: "Indonesia", share: 10 },
  ],
};

/**
 * Round-trip budget thresholds, in milliseconds.
 *
 * A caller forgives a slightly wrong answer and hangs up on a long pause, so
 * the perceived round trip — capture, transcribe, decide, synthesise, play —
 * is the number that decides whether a voice agent feels alive.
 */
export const LATENCY_BANDS = { excellent: 800, acceptable: 1200, risky: 2000 };

/** Utilisation thresholds for concurrency headroom. */
export const CAPACITY_BANDS = { thin: 0.85, idle: 0.4 };

function latencyVerdict(total: number): LatencyVerdict {
  if (total <= LATENCY_BANDS.excellent) return "excellent";
  if (total <= LATENCY_BANDS.acceptable) return "acceptable";
  if (total <= LATENCY_BANDS.risky) return "risky";
  return "poor";
}

function capacityVerdict(utilization: number): CapacityVerdict {
  if (utilization > 1) return "over";
  if (utilization > CAPACITY_BANDS.thin) return "thin";
  if (utilization < CAPACITY_BANDS.idle) return "idle";
  return "healthy";
}

const safe = (n: number): number => (Number.isFinite(n) && n > 0 ? n : 0);

export function computeVoiceOps(input: VoiceOpsInput): VoiceOpsResult {
  const calls = safe(input.callsPerMonth);
  const minutes = calls * safe(input.avgMinutes);

  const items: LineItem[] = [
    {
      key: "asr",
      usage: minutes,
      unit: "min",
      rate: safe(input.asrRatePerMin),
      cost: minutes * safe(input.asrRatePerMin),
    },
    {
      key: "llm",
      usage: calls,
      unit: "call",
      rate: safe(input.llmCostPerCall),
      cost: calls * safe(input.llmCostPerCall),
    },
    {
      key: "tts",
      usage: (calls * safe(input.ttsCharsPerCall)) / 1000,
      unit: "1k-chars",
      rate: safe(input.ttsRatePer1kChars),
      cost: ((calls * safe(input.ttsCharsPerCall)) / 1000) *
        safe(input.ttsRatePer1kChars),
    },
    {
      key: "telephony",
      usage: minutes,
      unit: "min",
      rate: safe(input.telephonyRatePerMin),
      cost: minutes * safe(input.telephonyRatePerMin),
    },
  ];

  const total = items.reduce((sum, i) => sum + i.cost, 0);

  const segments = [
    { key: "asr" as const, ms: safe(input.asrMs) },
    { key: "llm" as const, ms: safe(input.llmMs) },
    { key: "tts" as const, ms: safe(input.ttsMs) },
    { key: "network" as const, ms: safe(input.networkMs) },
  ];
  const latencyTotal = segments.reduce((sum, s) => sum + s.ms, 0);

  const provisioned = safe(input.provisioned);
  const peak = safe(input.peakConcurrent);
  const utilization = provisioned ? peak / provisioned : 0;

  const shareTotal = input.regions.reduce((sum, r) => sum + safe(r.share), 0);
  const regionLoad = input.regions.map((r) => ({
    name: r.name,
    concurrent: shareTotal ? (safe(r.share) / shareTotal) * peak : 0,
  }));

  return {
    minutes,
    items,
    total,
    costPerCall: calls ? total / calls : 0,
    costPerMinute: minutes ? total / minutes : 0,
    latency: {
      segments,
      total: latencyTotal,
      verdict: latencyVerdict(latencyTotal),
    },
    capacity: {
      utilization,
      headroom: provisioned - peak,
      verdict: capacityVerdict(utilization),
    },
    regionLoad,
  };
}

/** Format a number as USD. Locale is pinned so SSR and client agree. */
export function money(n: number, decimals = 2): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number.isFinite(n) ? n : 0);
}

/** Compact integer formatting (thousands separators), locale-pinned. */
export function num(n: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Number.isFinite(n) ? n : 0);
}
