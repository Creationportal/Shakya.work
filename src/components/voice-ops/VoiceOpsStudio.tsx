"use client";

import { useMemo, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import {
  DEFAULTS,
  computeVoiceOps,
  money,
  num,
  type VoiceOpsInput,
} from "@/lib/voice-ops";

/**
 * VoiceOpsStudio — an interactive voice-operations calculator.
 *
 * Everything is computed in the browser from pure functions in lib/voice-ops,
 * so the tool has no API dependency, no key and no running cost. Rates ship as
 * editable defaults rather than asserted vendor prices — the visitor plugs in
 * their contracted numbers.
 */

const SEGMENT_COLOR: Record<string, string> = {
  asr: "#7c3aed",
  llm: "#a78bfa",
  tts: "#6d28d9",
  network: "#c4b5fd",
};

const VERDICT_STYLE = {
  excellent: "text-[#1a7f43]",
  acceptable: "text-[#1a7f43]",
  risky: "text-[#b45309]",
  poor: "text-red-500",
  healthy: "text-[#1a7f43]",
  thin: "text-[#b45309]",
  over: "text-red-500",
  idle: "text-muted",
} as const;

function Field({
  label,
  value,
  step = 1,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  suffix?: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-wider text-muted">
        {label}
      </span>
      <div className="mt-1 flex items-center gap-2">
        <input
          type="number"
          value={value}
          step={step}
          min={0}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-[#7c3aed]"
        />
        {suffix && <span className="text-[11px] text-muted">{suffix}</span>}
      </div>
    </label>
  );
}

export default function VoiceOpsStudio() {
  const { t } = useLanguage();
  const [input, setInput] = useState<VoiceOpsInput>(DEFAULTS);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => computeVoiceOps(input), [input]);
  const set = <K extends keyof VoiceOpsInput>(key: K, value: VoiceOpsInput[K]) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  const setShare = (index: number, share: number) =>
    setInput((prev) => ({
      ...prev,
      regions: prev.regions.map((r, i) => (i === index ? { ...r, share } : r)),
    }));

  const unitLabel = (unit: string) =>
    unit === "min"
      ? t("voiceops.unitMin")
      : unit === "call"
        ? t("voiceops.unitCall")
        : t("voiceops.unit1kChars");

  async function copySummary() {
    const lines = [
      `${t("voiceops.monthlyTotal")}: ${money(result.total)}`,
      `${t("voiceops.costPerCall")}: ${money(result.costPerCall, 4)}`,
      `${t("voiceops.costPerMinute")}: ${money(result.costPerMinute, 4)}`,
      `${t("voiceops.latencyTotal")}: ${num(result.latency.total)} ms — ${t(
        `voiceops.v${result.latency.verdict.charAt(0).toUpperCase()}${result.latency.verdict.slice(1)}`
      )}`,
      `${t("voiceops.utilization")}: ${Math.round(result.capacity.utilization * 100)}% — ${t(
        `voiceops.v${result.capacity.verdict.charAt(0).toUpperCase()}${result.capacity.verdict.slice(1)}`
      )}`,
      ...result.regionLoad.map(
        (r) => `  ${r.name}: ${num(Math.round(r.concurrent))} ${t("voiceops.concurrent")}`
      ),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(lines);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — nothing to recover from */
    }
  }

  return (
    <div className="space-y-6">
      {/* ---------------- inputs ---------------- */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
            {t("voiceops.ratesNote")}
          </span>
          <button
            type="button"
            onClick={() => setInput(DEFAULTS)}
            className="text-[11px] text-muted underline-offset-2 hover:underline"
          >
            {t("voiceops.reset")}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-ink">
              {t("voiceops.volumeTitle")}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field
                label={t("voiceops.callsPerMonth")}
                value={input.callsPerMonth}
                step={1000}
                onChange={(n) => set("callsPerMonth", n)}
              />
              <Field
                label={t("voiceops.avgMinutes")}
                value={input.avgMinutes}
                step={0.5}
                onChange={(n) => set("avgMinutes", n)}
              />
              <Field
                label={t("voiceops.peakConcurrent")}
                value={input.peakConcurrent}
                step={100}
                onChange={(n) => set("peakConcurrent", n)}
              />
              <Field
                label={t("voiceops.provisioned")}
                value={input.provisioned}
                step={100}
                onChange={(n) => set("provisioned", n)}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">
              {t("voiceops.ratesTitle")}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field
                label={t("voiceops.asrRate")}
                value={input.asrRatePerMin}
                step={0.001}
                onChange={(n) => set("asrRatePerMin", n)}
              />
              <Field
                label={t("voiceops.llmCost")}
                value={input.llmCostPerCall}
                step={0.001}
                onChange={(n) => set("llmCostPerCall", n)}
              />
              <Field
                label={t("voiceops.ttsChars")}
                value={input.ttsCharsPerCall}
                step={50}
                onChange={(n) => set("ttsCharsPerCall", n)}
              />
              <Field
                label={t("voiceops.ttsRate")}
                value={input.ttsRatePer1kChars}
                step={0.001}
                onChange={(n) => set("ttsRatePer1kChars", n)}
              />
              <Field
                label={t("voiceops.telephonyRate")}
                value={input.telephonyRatePerMin}
                step={0.001}
                onChange={(n) => set("telephonyRatePerMin", n)}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">
              {t("voiceops.latencyTitle")}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field
                label={t("voiceops.asrMs")}
                value={input.asrMs}
                step={10}
                suffix="ms"
                onChange={(n) => set("asrMs", n)}
              />
              <Field
                label={t("voiceops.llmMs")}
                value={input.llmMs}
                step={10}
                suffix="ms"
                onChange={(n) => set("llmMs", n)}
              />
              <Field
                label={t("voiceops.ttsMs")}
                value={input.ttsMs}
                step={10}
                suffix="ms"
                onChange={(n) => set("ttsMs", n)}
              />
              <Field
                label={t("voiceops.networkMs")}
                value={input.networkMs}
                step={10}
                suffix="ms"
                onChange={(n) => set("networkMs", n)}
              />
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-ink">
              {t("voiceops.regionsTitle")}
            </h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {input.regions.map((r, i) => (
                <Field
                  key={r.name}
                  label={r.name}
                  value={r.share}
                  step={5}
                  suffix="%"
                  onChange={(n) => setShare(i, n)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ---------------- headline metrics ---------------- */}
      <div className="rounded-2xl border border-line bg-surface p-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-semibold text-ink">
              {money(result.costPerCall, 4)}
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted">
              {t("voiceops.costPerCall")}
            </p>
          </div>
          <div>
            <p className="text-lg font-semibold text-ink">{money(result.total)}</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted">
              {t("voiceops.monthlyTotal")}
            </p>
          </div>
          <div>
            <p className="text-lg font-semibold text-ink">
              {money(result.costPerMinute, 4)}
            </p>
            <p className="mt-0.5 text-[11px] uppercase tracking-wider text-muted">
              {t("voiceops.costPerMinute")}
            </p>
          </div>
        </div>
      </div>

      {/* ---------------- cost breakdown ---------------- */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted">
            {t("voiceops.breakdownTitle")}
          </h2>
          <button
            type="button"
            onClick={copySummary}
            className="text-[11px] text-muted underline-offset-2 hover:underline"
          >
            {copied ? t("voiceops.copied") : t("voiceops.copySummary")}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-muted">
                <th className="pb-2 pr-4 font-medium">{t("voiceops.component")}</th>
                <th className="pb-2 pr-4 font-medium">{t("voiceops.usage")}</th>
                <th className="pb-2 pr-4 font-medium">{t("voiceops.rate")}</th>
                <th className="pb-2 pr-4 text-right font-medium">
                  {t("voiceops.cost")}
                </th>
                <th className="pb-2 text-right font-medium">
                  {t("voiceops.share")}
                </th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((item) => (
                <tr key={item.key} className="border-b border-line/60">
                  <td className="py-2.5 pr-4 text-ink">
                    {t(`voiceops.${item.key}`)}
                  </td>
                  <td className="py-2.5 pr-4 text-muted">
                    {num(item.usage, item.unit === "min" ? 0 : 0)}{" "}
                    {unitLabel(item.unit)}
                  </td>
                  <td className="py-2.5 pr-4 text-muted">
                    {money(item.rate, item.rate < 0.01 ? 4 : 3)}
                  </td>
                  <td className="py-2.5 pr-4 text-right text-ink">
                    {money(item.cost)}
                  </td>
                  <td className="py-2.5 text-right text-muted">
                    {result.total
                      ? `${((item.cost / result.total) * 100).toFixed(1)}%`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ---------------- latency budget ---------------- */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted">
            {t("voiceops.latencyTotal")}
          </h2>
          <span className="text-sm font-semibold text-ink">
            {num(result.latency.total)} ms
          </span>
        </div>

        <div className="flex h-3 w-full overflow-hidden rounded-full bg-line">
          {result.latency.segments.map((s) => (
            <div
              key={s.key}
              style={{
                width: `${result.latency.total ? (s.ms / result.latency.total) * 100 : 0}%`,
                backgroundColor: SEGMENT_COLOR[s.key],
              }}
              title={`${t(`voiceops.${s.key}`)} · ${s.ms} ms`}
            />
          ))}
        </div>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
          {result.latency.segments.map((s) => (
            <span
              key={s.key}
              className="flex items-center gap-2 text-[12px] text-muted"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: SEGMENT_COLOR[s.key] }}
              />
              {t(`voiceops.${s.key}`)} · {s.ms} ms
            </span>
          ))}
        </div>

        <p
          className={`mt-4 text-sm font-medium ${VERDICT_STYLE[result.latency.verdict]}`}
        >
          {t(
            `voiceops.v${result.latency.verdict.charAt(0).toUpperCase()}${result.latency.verdict.slice(1)}`
          )}
        </p>
      </div>

      {/* ---------------- capacity ---------------- */}
      <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[11px] font-medium uppercase tracking-wider text-muted">
            {t("voiceops.capacityTitle")}
          </h2>
          <span className="text-sm font-semibold text-ink">
            {Math.round(result.capacity.utilization * 100)}%
          </span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-line">
          <div
            className="h-full rounded-full bg-[#7c3aed]"
            style={{
              width: `${Math.min(100, result.capacity.utilization * 100)}%`,
            }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-[12px] text-muted">
          <span>
            {t("voiceops.peakConcurrent")}: {num(input.peakConcurrent)}
          </span>
          <span>
            {t("voiceops.headroom")}: {num(Math.round(result.capacity.headroom))}
          </span>
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {result.regionLoad.map((r) => (
            <li
              key={r.name}
              className="flex items-center justify-between rounded-lg border border-line bg-paper px-3 py-2 text-[12px]"
            >
              <span className="text-ink">{r.name}</span>
              <span className="text-muted">
                {num(Math.round(r.concurrent))} {t("voiceops.concurrent")}
              </span>
            </li>
          ))}
        </ul>

        <p
          className={`mt-4 text-sm font-medium ${VERDICT_STYLE[result.capacity.verdict]}`}
        >
          {t(
            `voiceops.v${result.capacity.verdict.charAt(0).toUpperCase()}${result.capacity.verdict.slice(1)}`
          )}
        </p>
      </div>

      <p className="text-center text-[12px] text-muted">
        {t("voiceops.freeNote")}
      </p>
    </div>
  );
}
