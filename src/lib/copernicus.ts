// Browser-side reader for Copernicus Marine GLORYS12 (GLOBAL_MULTIYEAR_PHY_001_030) monthly means,
// via the public Copernicus Marine WMTS GetFeatureInfo endpoint (CORS enabled, one value per month and point).
import type { SeriesResult, YearPoint } from "./ocean.functions";

const WMTS = "https://wmts.marine.copernicus.eu/teroWmts";
const DS = "GLOBAL_MULTIYEAR_PHY_001_030/cmems_mod_glo_phy_my_0.083deg_P1M-m_202311";
const SURFACE = "-0.49402499198913574"; // first GLORYS level (~0.5 m)
const MONTHS = ["01", "04", "07", "10"]; // seasonal sampling keeps the request count reasonable
const FIRST_YEAR = 1993;
const LAST_YEAR = 2025;

function tile(lat: number, lon: number) {
  const z = 6, deg = 180 / 2 ** z; // EPSG:4326 matrix: 2^(z+1) × 2^z tiles of 256 px
  const x = lon + 180, y = 90 - lat;
  const col = Math.floor(x / deg), row = Math.floor(y / deg);
  return { z, col, row, i: Math.floor(((x - col * deg) / deg) * 256), j: Math.floor(((y - row * deg) / deg) * 256) };
}

async function value(variable: string, lat: number, lon: number, time: string): Promise<number | null> {
  const t = tile(lat, lon);
  const url = `${WMTS}?SERVICE=WMTS&REQUEST=GetFeatureInfo&VERSION=1.0.0&LAYER=${encodeURIComponent(`${DS}/${variable}`)}&STYLE=&TILEMATRIXSET=EPSG:4326&TILEMATRIX=${t.z}&TILEROW=${t.row}&TILECOL=${t.col}&I=${t.i}&J=${t.j}&INFOFORMAT=application/json&time=${time}T00:00:00Z&elevation=${SURFACE}`;
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const j = (await r.json()) as { features?: { properties?: { value?: number | null } }[] };
    const v = j.features?.[0]?.properties?.value;
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

async function pool<T>(jobs: (() => Promise<T>)[], size = 12): Promise<T[]> {
  const out: T[] = new Array(jobs.length);
  let k = 0;
  await Promise.all(Array.from({ length: size }, async () => { while (k < jobs.length) { const i = k++; out[i] = await jobs[i]!(); } }));
  return out;
}

export type CmemsKind = "salinity" | "currents";

export async function getCopernicusSeries(kind: CmemsKind, lat: number, lon: number, start: number, end: number): Promise<SeriesResult> {
  const from = Math.max(FIRST_YEAR, start), to = Math.min(LAST_YEAR, end);
  const base = {
    units: kind === "salinity" ? "PSU" : "m/s",
    source: "Copernicus Marine — GLORYS12V1 (GLOBAL_MULTIYEAR_PHY_001_030), moyennes mensuelles",
    method: kind === "salinity"
      ? "Salinité de surface (≈0,5 m), moyenne des mois de janvier, avril, juillet et octobre de chaque année"
      : "Vitesse du courant de surface √(u²+v²) (≈0,5 m), moyenne des mois de janvier, avril, juillet et octobre",
    query: `${WMTS} · ${DS} · ${lat}°, ${lon}°`,
  };
  if (from > to) return { ...base, points: [], missingYears: [], error: "GLORYS12 couvre 1993–2025 uniquement" };
  const slots: { y: number; m: string }[] = [];
  for (let y = from; y <= to; y++) for (const m of MONTHS) slots.push({ y, m });
  const vals = await pool(slots.map((s) => async () => {
    const t = `${s.y}-${s.m}-01`;
    if (kind === "salinity") return value("so", lat, lon, t);
    const [u, v] = await Promise.all([value("uo", lat, lon, t), value("vo", lat, lon, t)]);
    return u === null || v === null ? null : Math.hypot(u, v);
  }));
  const points: YearPoint[] = []; const missing: number[] = [];
  for (let y = from; y <= to; y++) {
    const ys = vals.filter((_, i) => slots[i]!.y === y).filter((v): v is number => v !== null);
    if (ys.length) points.push({ year: y, value: Math.round((ys.reduce((a, b) => a + b, 0) / ys.length) * 1000) / 1000, n: ys.length });
    else { points.push({ year: y, value: null, n: 0 }); missing.push(y); }
  }
  if (!points.some((p) => p.value !== null)) return { ...base, points, missingYears: missing, error: "Copernicus Marine n'a renvoyé aucune valeur pour ce point (terre ou service indisponible)" };
  return { ...base, points, missingYears: missing };
}
