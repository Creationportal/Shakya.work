export type Candle = {
  t: number;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
};

export function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = [];
  let prev = values[0] ?? 0;
  for (let i = 0; i < values.length; i++) {
    if (i === 0) {
      out.push(values[0]);
      prev = values[0];
    } else {
      const v = values[i] * k + prev * (1 - k);
      out.push(v);
      prev = v;
    }
  }
  return out;
}

export function macd(
  prices: number[],
  fast = 12,
  slow = 26,
  signalPeriod = 9,
) {
  const emaFast = ema(prices, fast);
  const emaSlow = ema(prices, slow);
  const macdLine = prices.map((_, i) => emaFast[i] - emaSlow[i]);
  const signalLine = ema(macdLine, signalPeriod);
  const histogram = macdLine.map((m, i) => m - signalLine[i]);
  return { macd: macdLine, signal: signalLine, histogram };
}

export function rsi(prices: number[], period = 14): number[] {
  const out: number[] = new Array(prices.length).fill(NaN);
  if (prices.length <= period) return out;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period; i < prices.length; i++) {
    if (i === period) {
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      out[i] = 100 - 100 / (1 + rs);
    } else {
      const diff = prices[i] - prices[i - 1];
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      out[i] = 100 - 100 / (1 + rs);
    }
  }
  return out;
}

export function generateCandles(
  count: number,
  startPrice: number,
  endTime: number,
  intervalMs: number,
  seed: number,
): Candle[] {
  const rng = mulberry32(seed);
  const candles: Candle[] = [];
  let price = startPrice;
  let time = endTime - count * intervalMs;
  for (let i = 0; i < count; i++) {
    const drift = (rng() - 0.5) * 0.01 * price;
    const vol = price * 0.005;
    const o = price;
    const c = Math.max(0.01, price + drift);
    const h = Math.max(o, c) + rng() * vol;
    const l = Math.min(o, c) - rng() * vol;
    const v = 50 + rng() * 200;
    candles.push({ t: time, o, h, l, c, v });
    price = c;
    time += intervalMs;
  }
  return candles;
}

export function updateLastCandle(
  candles: Candle[],
  price: number,
  time: number,
  volume: number,
): Candle[] {
  if (candles.length === 0) return candles;
  const last = candles[candles.length - 1];
  if (time - last.t >= 60_000) {
    // new minute
    return [
      ...candles.slice(1),
      { t: last.t + 60_000, o: last.c, h: Math.max(last.c, price), l: Math.min(last.c, price), c: price, v: volume },
    ];
  }
  const updated: Candle = {
    ...last,
    h: Math.max(last.h, price),
    l: Math.min(last.l, price),
    c: price,
    v: last.v + volume,
  };
  return [...candles.slice(0, -1), updated];
}

function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
