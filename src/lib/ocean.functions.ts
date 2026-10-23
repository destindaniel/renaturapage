import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildLiteratureUrl, parseWorks, type LitResult } from "./openalex";

const UA = { "User-Agent": "RenaturOcean/1.0 (contact@renatura.cg)" };
const ERDDAP_NOAA = "https://coastwatch.pfeg.noaa.gov/erddap/griddap/nceiErsstv5.csv";
const ERDDAP_ARGO = "https://erddap.ifremer.fr/erddap/tabledap/ArgoFloats.csv";

export interface YearPoint { year: number; value: number | null; n: number }
export interface SeriesResult { points: YearPoint[]; units: string; source: string; method: string; missingYears: number[]; error?: string; query: string }

function annualize(rows: { t: string; v: number }[], from: number, to: number): { points: YearPoint[]; missing: number[] } {
  const acc = new Map<number, { s: number; n: number }>();
  for (const r of rows) {
    if (!Number.isFinite(r.v)) continue;
    const y = Number(r.t.slice(0, 4));
    const a = acc.get(y) ?? { s: 0, n: 0 };
    a.s += r.v; a.n++; acc.set(y, a);
  }
  const points: YearPoint[] = []; const missing: number[] = [];
  for (let y = from; y <= to; y++) {
    const a = acc.get(y);
    if (a && a.n > 0) points.push({ year: y, value: Math.round((a.s / a.n) * 1000) / 1000, n: a.n });
    else { points.push({ year: y, value: null, n: 0 }); missing.push(y); }
  }
  return { points, missing };
}

const seriesInput = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  start: z.number().int().min(1940).max(2100),
  end: z.number().int().min(1940).max(2100),
});

export const getSstSeries = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => seriesInput.parse(d))
  .handler(async ({ data }): Promise<SeriesResult> => {
    const start = Math.max(1854, data.start);
    const end = Math.min(new Date().getFullYear(), data.end);
    const lon = ((data.lon % 360) + 360) % 360; // ERSST uses 0–360
    const q = `${ERDDAP_NOAA}?sst%5B(${start}-01-01):1:(${end}-12-01)%5D%5B(0.0)%5D%5B(${data.lat})%5D%5B(${lon})%5D`;
    const base = { units: "°C", source: "NOAA ERSST v5 via ERDDAP NOAA CoastWatch", method: "Moyenne annuelle des valeurs mensuelles de la maille 2° la plus proche", query: q };
    try {
      let res = await fetch(q, { headers: UA });
      if (!res.ok) {
        // end month may not exist yet: retry with "last"
        res = await fetch(q.replace(`(${end}-12-01)`, "last"), { headers: UA });
      }
      if (!res.ok) return { ...base, points: [], missingYears: [], error: `NOAA ERDDAP a répondu ${res.status}` };
      const lines = (await res.text()).trim().split("\n").slice(2);
      const rows = lines.map((l) => { const c = l.split(","); return { t: c[0] ?? "", v: Number(c[4]) }; });
      const { points, missing } = annualize(rows, start, end);
      return { ...base, points, missingYears: missing };
    } catch (e) {
      return { ...base, points: [], missingYears: [], error: "Source NOAA injoignable" };
    }
  });

export const getWaveSeries = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => seriesInput.parse(d))
  .handler(async ({ data }): Promise<SeriesResult> => {
    const start = Math.max(1940, data.start);
    const now = new Date(); now.setDate(now.getDate() - 6);
    const endDate = data.end >= now.getFullYear() ? now.toISOString().slice(0, 10) : `${data.end}-12-31`;
    const end = Number(endDate.slice(0, 4));
    const q = `https://marine-api.open-meteo.com/v1/marine?latitude=${data.lat}&longitude=${data.lon}&daily=wave_height_max&models=era5_ocean&start_date=${start}-01-01&end_date=${endDate}`;
    const base = { units: "m", source: "ECMWF ERA5 (vagues WAM) via Open-Meteo", method: "Moyenne annuelle de la hauteur significative maximale journalière", query: q };
    try {
      const res = await fetch(q, { headers: UA });
      if (!res.ok) return { ...base, points: [], missingYears: [], error: `Open-Meteo a répondu ${res.status}` };
      const j = (await res.json()) as { daily?: { time: string[]; wave_height_max: (number | null)[] } };
      const rows = (j.daily?.time ?? []).map((t, i) => ({ t, v: j.daily!.wave_height_max[i] ?? NaN }));
      const { points, missing } = annualize(rows, start, end);
      return { ...base, points, missingYears: missing };
    } catch {
      return { ...base, points: [], missingYears: [], error: "Source Open-Meteo injoignable" };
    }
  });

export interface ArgoProfile { platform: string; time: string; lat: number; lon: number }

export const getArgoProfiles = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]), start: z.number().int(), end: z.number().int() }).parse(d),
  )
  .handler(async ({ data }) => {
    const [s, w, n, e] = data.bbox;
    const enc = encodeURIComponent;
    const q = `${ERDDAP_ARGO}?platform_number%2Ctime%2Clatitude%2Clongitude&latitude${enc(">=")}${s}&latitude${enc("<=")}${n}&longitude${enc(">=")}${w}&longitude${enc("<=")}${e}&time${enc(">=")}${Math.max(1999, data.start)}-01-01&time${enc("<=")}${data.end}-12-31T23:59:59Z&distinct()&orderByMax(${enc('"platform_number"')})`;
    const plain = q.replace(/&orderByMax.*$/, "");
    try {
      const res = await fetch(plain, { headers: UA });
      if (res.status === 404) return { profiles: [] as ArgoProfile[], total: 0, query: plain };
      if (!res.ok) return { profiles: [] as ArgoProfile[], total: 0, query: plain, error: `Ifremer ERDDAP a répondu ${res.status}` };
      const lines = (await res.text()).trim().split("\n").slice(2);
      const all = lines.map((l) => { const c = l.split(","); return { platform: c[0] ?? "", time: c[1] ?? "", lat: Number(c[2]), lon: Number(c[3]) }; });
      all.sort((a, b) => b.time.localeCompare(a.time));
      return { profiles: all.slice(0, 200), total: all.length, query: plain };
    } catch {
      return { profiles: [] as ArgoProfile[], total: 0, query: plain, error: "Ifremer ERDDAP injoignable" };
    }
  });

// ---- Literature (OpenAlex) ----
export type { Work } from "./openalex";

export const searchLiterature = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({
      q: z.string().max(200),
      theme: z.string().max(80).default(""),
      fromYear: z.number().int().min(1900).max(2100),
      toYear: z.number().int().min(1900).max(2100),
      oaOnly: z.boolean(),
      type: z.string().max(40).default(""),
      page: z.number().int().min(1).max(50),
    }).parse(d),
  )
  .handler(async ({ data }): Promise<LitResult> => {
    const url = buildLiteratureUrl(data, process.env["OPENALEX_API_KEY"]);
    try {
      const res = await fetch(url, { headers: UA });
      if (!res.ok) return { works: [], count: 0, error: `OpenAlex a répondu ${res.status}` };
      return parseWorks(await res.json());
    } catch {
      return { works: [], count: 0, error: "OpenAlex injoignable" };
    }
  });

// ---- Live connection test for every configured source ----
export const checkSources = createServerFn({ method: "GET" }).handler(async () => {
  const probe = async (name: string, url: string) => {
    const t = Date.now();
    try {
      const r = await fetch(url, { headers: UA });
      return { name, ok: r.ok, status: r.status, ms: Date.now() - t };
    } catch {
      return { name, ok: false, status: 0, ms: Date.now() - t };
    }
  };
  const tests = await Promise.all([
    probe("NOAA NCEI (ERSST v5)", `${ERDDAP_NOAA}?sst%5B(last)%5D%5B(0.0)%5D%5B(-4)%5D%5B(12)%5D`),
    probe("ERA5 vagues (Open-Meteo)", "https://marine-api.open-meteo.com/v1/marine?latitude=-4.8&longitude=11.7&daily=wave_height_max&forecast_days=1"),
    probe("Programme Argo (Ifremer)", "https://erddap.ifremer.fr/erddap/info/ArgoFloats/index.json"),
    probe("OpenAlex", "https://api.openalex.org/works?per-page=1&search=congo%20ocean"),
  ]);
  return { tests, checkedAt: new Date().toISOString() };
});
