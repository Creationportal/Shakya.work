"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation, useLanguage } from "@/lib/i18n";
import { en, zh } from "@/lib/i18n/dictionaries";
import {
  Candle,
  generateCandles,
  macd,
  rsi,
  updateLastCandle,
} from "@/lib/trading/indicators";

const dictionaries = { en, zh };

const SYMBOLS: Record<string, { label: string; basePrice: number }> = {
  "BTC/USDT": { label: "BTC / USDT", basePrice: 65000 },
  "ETH/USDT": { label: "ETH / USDT", basePrice: 3500 },
  "SOL/USDT": { label: "SOL / USDT", basePrice: 160 },
};

const PROVIDERS = ["binance", "coingecko", "mock"] as const;
type Provider = (typeof PROVIDERS)[number];

function providerSeed(p: Provider, symbol: string): number {
  let s = 0;
  for (const c of p + symbol) s = (s * 31 + c.charCodeAt(0)) >>> 0;
  return s;
}

function formatNumber(n: number, dp = 2) {
  if (!isFinite(n)) return "—";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  });
}

function formatUSD(n: number) {
  if (!isFinite(n)) return "—";
  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}

export default function TradingDashboard() {
  const { t } = useTranslation();
  const { lang } = useLanguage();
  const [provider, setProvider] = useState<Provider>("binance");
  const [symbol, setSymbol] = useState<string>("BTC/USDT");
  const [candles, setCandles] = useState<Candle[]>([]);

  const priceRef = useRef<HTMLCanvasElement | null>(null);
  const macdRef = useRef<HTMLCanvasElement | null>(null);
  const rsiRef = useRef<HTMLCanvasElement | null>(null);

  // Initial data + regen on provider/symbol change
  useEffect(() => {
    const meta = SYMBOLS[symbol];
    const seed = providerSeed(provider, symbol);
    const start = meta.basePrice * (0.9 + (seed % 200) / 1000);
    const data = generateCandles(200, start, Date.now(), 60_000, seed);
    // (Re)generate simulated candles when the symbol/provider changes. This is
    // derived client-side data (not fetched), so seeding state from an effect
    // is the intended pattern here.
    /* eslint-disable-next-line react-hooks/set-state-in-effect -- (re)seed simulated candle data on symbol/provider change */
    setCandles(data);
  }, [provider, symbol]);

  // Live update
  useEffect(() => {
    if (candles.length === 0) return;
    const id = setInterval(() => {
      setCandles((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];
        const drift = (Math.random() - 0.5) * 0.003 * last.c;
        const next = Math.max(0.01, last.c + drift);
        return updateLastCandle(prev, next, Date.now(), 1 + Math.random() * 4);
      });
    }, 2000);
    return () => clearInterval(id);
  }, [candles.length, symbol, provider]);

  // Compute indicators
  const closes = useMemo(() => candles.map((c) => c.c), [candles]);
  const { macd: mLine, signal: sLine, histogram } = useMemo(
    () => macd(closes),
    [closes],
  );
  const rsiSeries = useMemo(() => rsi(closes, 14), [closes]);

  // Market summary
  const summary = useMemo(() => {
    if (candles.length === 0) {
      return { last: 0, changePct: 0, high: 0, low: 0, volume: 0 };
    }
    const last = candles[candles.length - 1].c;
    const first = candles[0].c;
    const changePct = first > 0 ? ((last - first) / first) * 100 : 0;
    let high = -Infinity;
    let low = Infinity;
    let volume = 0;
    for (const c of candles) {
      if (c.h > high) high = c.h;
      if (c.l < low) low = c.l;
      volume += c.v;
    }
    return { last, changePct, high, low, volume };
  }, [candles]);

  const signal = useMemo(() => {
    const lastMacd = mLine[mLine.length - 1];
    const lastSignal = sLine[sLine.length - 1];
    const lastRsi = rsiSeries[rsiSeries.length - 1];
    if (!isFinite(lastMacd) || !isFinite(lastSignal) || !isFinite(lastRsi)) {
      return { textKey: "hold", bullish: false };
    }
    const macdCross = lastMacd - lastSignal;
    if (macdCross > 0 && lastRsi < 70) return { textKey: "buy", bullish: true };
    if (macdCross < 0 && lastRsi > 30)
      return { textKey: "sell", bullish: false };
    return { textKey: "hold", bullish: false };
  }, [mLine, sLine, rsiSeries]);

  // Draw charts
  useEffect(() => {
    if (candles.length === 0) return;
    drawSeries(
      priceRef.current,
      [
        {
          data: candles.map((c) => ({ x: c.t, y: c.c })),
          color: "#7c3aed",
          fill: "rgba(124,58,237,0.18)",
        },
      ],
      {},
    );
    drawSeries(
      macdRef.current,
      [
        {
          data: candles.map((c, i) => ({ x: c.t, y: mLine[i] })),
          color: "#7c3aed",
        },
        {
          data: candles.map((c, i) => ({ x: c.t, y: sLine[i] })),
          color: "#f59e0b",
          dashed: true,
        },
        {
          data: candles.map((c, i) => ({ x: c.t, y: histogram[i] })),
          color: "#10b981",
          bars: true,
        },
      ],
      { baseline: 0 },
    );
    drawSeries(
      rsiRef.current,
      [
        {
          data: candles.map((c, i) => ({ x: c.t, y: rsiSeries[i] })),
          color: "#3b82c4",
        },
      ],
      { bands: [30, 70] },
    );
  }, [candles, mLine, sLine, histogram, rsiSeries]);

  const latest = candles.slice(-10).reverse();

  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {t("trading.eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            {t("trading.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
            {t("trading.description")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            {t("trading.statusSimulated")}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="rounded-lg border border-line bg-surface p-4">
          <span className="block text-[11px] font-mono uppercase tracking-widest text-muted">
            {t("trading.providerLabel")}
          </span>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
            className="mt-2 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          >
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {t(`trading.providers.${p}`)}
              </option>
            ))}
          </select>
        </label>
        <label className="rounded-lg border border-line bg-surface p-4">
          <span className="block text-[11px] font-mono uppercase tracking-widest text-muted">
            {t("trading.symbolLabel")}
          </span>
          <select
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="mt-2 w-full rounded-md border border-line bg-paper px-3 py-2 text-sm text-ink focus:border-accent focus:outline-none"
          >
            {Object.keys(SYMBOLS).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Market info */}
      <section className="mt-6 rounded-xl border border-line bg-surface p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-mono uppercase tracking-widest text-muted">
            {t("trading.marketInfoTitle")}
          </h2>
          <span className="text-lg font-semibold text-ink">
            {SYMBOLS[symbol]?.label}
          </span>
        </div>
        <div className="grid gap-4 sm:grid-cols-5">
          <Stat label={t("trading.chartPrice")} value={formatUSD(summary.last)} />
          <Stat
            label={t("trading.change24")}
            value={`${summary.changePct >= 0 ? "+" : ""}${formatNumber(summary.changePct, 2)}%`}
            tone={summary.changePct >= 0 ? "up" : "down"}
          />
          <Stat label={t("trading.high24")} value={formatUSD(summary.high)} />
          <Stat label={t("trading.low24")} value={formatUSD(summary.low)} />
          <Stat
            label={t("trading.vol24")}
            value={formatNumber(summary.volume, 0)}
          />
        </div>
      </section>

      {/* Charts */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ChartCard title={t("trading.chartPrice")} canvasRef={priceRef} />
        <ChartCard
          title={t("trading.macdTitle")}
          canvasRef={macdRef}
        />
        <ChartCard
          title={t("trading.rsiTitle")}
          canvasRef={rsiRef}
          className="lg:col-span-2"
        />
      </div>

      {/* Indicators + signal */}
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface p-5">
          <h3 className="text-sm font-mono uppercase tracking-widest text-muted">
            {t("trading.indicatorsTitle")}
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted">MACD</p>
              <p className="font-mono text-ink">
                {formatNumber(mLine[mLine.length - 1] ?? 0, 4)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">{t("trading.indicatorSignal")}</p>
              <p className="font-mono text-ink">
                {formatNumber(sLine[sLine.length - 1] ?? 0, 4)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">{t("trading.indicatorHistogram")}</p>
              <p className="font-mono text-ink">
                {formatNumber(histogram[histogram.length - 1] ?? 0, 4)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">{t("trading.indicatorRsi")}</p>
              <p className="font-mono text-ink">
                {formatNumber(rsiSeries[rsiSeries.length - 1] ?? 0, 2)}
              </p>
            </div>
          </div>
        </section>
        <section className="rounded-xl border border-line bg-surface p-5">
          <h3 className="text-sm font-mono uppercase tracking-widest text-muted">
            {t("trading.signalSummary")}
          </h3>
          <p
            className={`mt-4 text-2xl font-semibold ${
              signal.textKey === "buy"
                ? "text-emerald-500"
                : signal.textKey === "sell"
                  ? "text-red-500"
                  : "text-muted"
            }`}
          >
            {t(`trading.signal${signal.textKey.charAt(0).toUpperCase() + signal.textKey.slice(1)}`)}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            MACD {formatNumber(mLine[mLine.length - 1] ?? 0, 3)} ·{" "}
            {t("trading.indicatorSignal")}{" "}
            {formatNumber(sLine[sLine.length - 1] ?? 0, 3)} · RSI{" "}
            {formatNumber(rsiSeries[rsiSeries.length - 1] ?? 0, 1)}
          </p>
        </section>
      </div>

      {/* Latest candles */}
      <section className="mt-6 rounded-xl border border-line bg-surface p-5">
        <h3 className="text-sm font-mono uppercase tracking-widest text-muted">
          {t("trading.latestCandles")}
        </h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs font-mono uppercase tracking-widest text-muted">
              <tr>
                <th className="px-3 py-2 text-left">{t("trading.candleTime")}</th>
                <th className="px-3 py-2 text-right">{t("trading.candleOpen")}</th>
                <th className="px-3 py-2 text-right">{t("trading.candleHigh")}</th>
                <th className="px-3 py-2 text-right">{t("trading.candleLow")}</th>
                <th className="px-3 py-2 text-right">{t("trading.candleClose")}</th>
              </tr>
            </thead>
            <tbody>
              {latest.map((c) => (
                <tr key={c.t} className="border-t border-line">
                  <td className="px-3 py-2 font-mono text-xs text-muted">
                    {new Date(c.t).toLocaleTimeString()}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-ink">
                    {formatNumber(c.o, 2)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-ink">
                    {formatNumber(c.h, 2)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-ink">
                    {formatNumber(c.l, 2)}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-ink">
                    {formatNumber(c.c, 2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Improvement roadmap */}
      <section className="mt-6 rounded-xl border border-line bg-surface p-6">
        <h3 className="text-sm font-mono uppercase tracking-widest text-muted">
          {t("trading.reportTitle")}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {t("trading.reportBody")}
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted">
          {(
            ((dictionaries[lang] as unknown as {
              trading: { reportItems: string[] };
            }).trading?.reportItems ?? [])
          ).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "up" | "down";
}) {
  return (
    <div className="rounded-lg border border-line bg-paper p-3">
      <p className="text-[11px] font-mono uppercase tracking-widest text-muted">
        {label}
      </p>
      <p
        className={`mt-1 font-mono text-lg ${
          tone === "up"
            ? "text-emerald-500"
            : tone === "down"
              ? "text-red-500"
              : "text-ink"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function ChartCard({
  title,
  canvasRef,
  className,
}: {
  title: string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-line bg-surface p-5 ${className ?? ""}`}
    >
      <h3 className="text-sm font-mono uppercase tracking-widest text-muted">
        {title}
      </h3>
      <div className="mt-3 h-44 w-full">
        <canvas ref={canvasRef} className="h-full w-full" />
      </div>
    </section>
  );
}

type Point = { x: number; y: number };
type Series = {
  data: Point[];
  color: string;
  dashed?: boolean;
  bars?: boolean;
  fill?: string;
};

function drawSeries(
  canvas: HTMLCanvasElement | null,
  seriesList: Series[],
  options: {
    fill?: string;
    line?: string;
    baseline?: number;
    minY?: number;
    maxY?: number;
    bands?: number[];
  } = {},
) {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0) return;
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const W = rect.width;
  const H = rect.height;
  ctx.clearRect(0, 0, W, H);

  const all: Point[] = [];
  seriesList.forEach((s) =>
    all.push(...s.data.filter((p) => isFinite(p.y))),
  );
  if (all.length < 2) return;

  let minY = options.minY ?? Math.min(...all.map((p) => p.y));
  let maxY = options.maxY ?? Math.max(...all.map((p) => p.y));
  if (options.bands) {
    for (const b of options.bands) {
      minY = Math.min(minY, b);
      maxY = Math.max(maxY, b);
    }
  }
  if (options.baseline != null) {
    minY = Math.min(minY, options.baseline);
    maxY = Math.max(maxY, options.baseline);
  }
  if (maxY - minY < 1e-9) {
    maxY += 1;
    minY -= 1;
  }

  const xMin = Math.min(...all.map((p) => p.x));
  const xMax = Math.max(...all.map((p) => p.x));
  const pad = { l: 36, r: 10, t: 10, b: 18 };
  const gw = W - pad.l - pad.r;
  const gh = H - pad.t - pad.b;
  const X = (x: number) =>
    pad.l + (xMax === xMin ? 0.5 : (x - xMin) / (xMax - xMin)) * gw;
  const Y = (y: number) =>
    pad.t + (1 - (y - minY) / (maxY - minY)) * gh;

  // grid
  ctx.strokeStyle = "rgba(0,0,0,0.06)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let i = 0; i <= 3; i++) {
    const y = pad.t + (gh * i) / 3;
    ctx.moveTo(pad.l, y);
    ctx.lineTo(pad.l + gw, y);
  }
  ctx.stroke();

  if (options.bands) {
    ctx.strokeStyle = "rgba(124,58,237,0.25)";
    ctx.setLineDash([3, 3]);
    options.bands.forEach((b) => {
      const y = Y(b);
      ctx.beginPath();
      ctx.moveTo(pad.l, y);
      ctx.lineTo(pad.l + gw, y);
      ctx.stroke();
    });
    ctx.setLineDash([]);
  }

  if (options.baseline != null) {
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pad.l, Y(options.baseline));
    ctx.lineTo(pad.l + gw, Y(options.baseline));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  seriesList.forEach((s) => {
    const valid = s.data.filter((p) => isFinite(p.y));
    if (valid.length < 2) return;
    if (s.bars) {
      valid.forEach((p) => {
        const x = X(p.x);
        const y = Y(p.y);
        const baseline = Y(options.baseline ?? 0);
        ctx.fillStyle = p.y >= 0 ? "#10b981" : "#ef4444";
        ctx.fillRect(x - 0.8, Math.min(y, baseline), 1.6, Math.abs(baseline - y));
      });
      return;
    }
    if (s.fill) {
      const g = ctx.createLinearGradient(0, pad.t, 0, pad.t + gh);
      g.addColorStop(0, s.fill);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.moveTo(X(valid[0].x), Y(valid[0].y));
      valid.forEach((p) => ctx.lineTo(X(p.x), Y(p.y)));
      ctx.lineTo(X(valid[valid.length - 1].x), pad.t + gh);
      ctx.lineTo(X(valid[0].x), pad.t + gh);
      ctx.closePath();
      ctx.fillStyle = g;
      ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(X(valid[0].x), Y(valid[0].y));
    valid.forEach((p) => ctx.lineTo(X(p.x), Y(p.y)));
    ctx.strokeStyle = s.color;
    ctx.lineWidth = 1.6;
    if (s.dashed) ctx.setLineDash([4, 3]);
    ctx.stroke();
    ctx.setLineDash([]);
  });

  // y labels
  ctx.fillStyle = "rgba(120,120,120,0.9)";
  ctx.font = "10px system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  for (let i = 0; i <= 3; i++) {
    const v = maxY - ((maxY - minY) * i) / 3;
    ctx.fillText(v.toFixed(2), pad.l - 4, pad.t + (gh * i) / 3);
  }
}
