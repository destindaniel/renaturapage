// Browser-safe calls made from the visitor's own connection, to avoid shared
// server IP rate limits (HTTP 429) on Open-Meteo and OpenAlex in production.
import type { SeriesResult, YearPoint } from "./ocean.functions";
import { getWaveSeries } from "./ocean.functions";

type SeriesInput = { lat: number; lon: number; start: number; end: number };

async function wavesInBrowser(d: SeriesInput): Promise<SeriesResult> {
  const start = Math.max(1940, d.start);
  const now = new Date(); now.setDate(now.getDate() - 6);
  const endDate = d.end >= now.getFullYear() ? now.toISOString().slice(0, 10) : `${d.end}-12-31`;
  const end = Number(endDate.slice(0, 4));
  const q = `https://marine-api.open-meteo.com/v1/marine?latitude=${d.lat}&longitude=${d.lon}&daily=wave_height_max&models=era5_ocean&start_date=${start}-01-01&end_date=${endDate}`;
  const res = await fetch(q);
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const j = (await res.json()) as { daily?: { time: string[]; wave_height_max: (number | null)[] } };
  const acc = new Map<number, { s: number; n: number }>();
  (j.daily?.time ?? []).forEach((t, i) => {
    const v = j.daily!.wave_height_max[i];
    if (v == null || !Number.isFinite(v)) return;
    const y = Number(t.slice(0, 4));
    const a = acc.get(y) ?? { s: 0, n: 0 };
    a.s += v; a.n++; acc.set(y, a);
  });
  const points: YearPoint[] = []; const missing: number[] = [];
  for (let y = start; y <= end; y++) {
    const a = acc.get(y);
    if (a && a.n > 0) points.push({ year: y, value: Math.round((a.s / a.n) * 1000) / 1000, n: a.n });
    else { points.push({ year: y, value: null, n: 0 }); missing.push(y); }
  }
  return { points, missingYears: missing, units: "m", source: "ECMWF ERA5 (vagues WAM) via Open-Meteo", method: "Moyenne annuelle de la hauteur significative maximale journalière", query: q };
}

export async function getWaves({ data }: { data: SeriesInput }): Promise<SeriesResult> {
  try { return await wavesInBrowser(data); } catch { return getWaveSeries({ data }); }
}

export async function probeInBrowser(name: string, url: string) {
  const t = Date.now();
  try {
    const r = await fetch(url);
    return { name, ok: r.ok, status: r.status, ms: Date.now() - t };
  } catch {
    return { name, ok: false, status: 0, ms: Date.now() - t };
  }
}

export const BROWSER_PROBES: Record<string, string> = {
  "ERA5 vagues (Open-Meteo)": "https://marine-api.open-meteo.com/v1/marine?latitude=-4.8&longitude=11.7&daily=wave_height_max&forecast_days=1",
  OpenAlex: "https://api.openalex.org/works?per-page=1&search=congo%20ocean",
};
