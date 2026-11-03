// Browser-side reader for Copernicus Marine GLORYS12 (GLOBAL_MULTIYEAR_PHY_001_030) monthly means,
// via the public Copernicus Marine WMTS GetFeatureInfo endpoint (CORS enabled, one value per month and point).
import type { SeriesResult, YearPoint } from "./ocean.functions";
import cache from "@/data/glorys-series.json";

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

async function value(variable: string, lat: number, lon: number, time: string, layer?: string, elevation: string | null = SURFACE): Promise<number | null> {
  const t = tile(lat, lon);
  const url = `${WMTS}?SERVICE=WMTS&REQUEST=GetFeatureInfo&VERSION=1.0.0&LAYER=${encodeURIComponent(layer ?? `${DS}/${variable}`)}&STYLE=&TILEMATRIXSET=EPSG:4326&TILEMATRIX=${t.z}&TILEROW=${t.row}&TILECOL=${t.col}&I=${t.i}&J=${t.j}&INFOFORMAT=application/json&time=${time}T00:00:00Z${elevation ? `&elevation=${elevation}` : ""}`;
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

export type CmemsKind = "salinity" | "currents" | "temperature" | "sealevel" | "chl" | "ph" | "oisst";

// Other Copernicus Marine products read the same way (layer, surface level, coverage, units, method).
const EXTRA: Record<"sealevel" | "chl" | "ph", { layer: string; elevation: string | null; first: number; months: string[]; units: string; source: string; method: string }> = {
  sealevel: { layer: "SEALEVEL_GLO_PHY_L4_MY_008_047/cmems_obs-sl_glo_phy-ssh_my_allsat-l4-duacs-0.125deg_P1M-m_202411/sla", elevation: null, first: 1993, months: MONTHS, units: "m",
    source: "Copernicus Marine — SEALEVEL_GLO_PHY_L4_MY_008_047 (DUACS), moyennes mensuelles", method: "Anomalie du niveau de la mer (SLA, réf. 1993–2012), moyenne des mois de janvier, avril, juillet et octobre" },
  chl: { layer: "OCEANCOLOUR_GLO_BGC_L4_MY_009_104/cmems_obs-oc_glo_bgc-plankton_my_l4-multi-4km_P1M_202603/CHL", elevation: null, first: 1997, months: ["01","02","03","04","05","06","07","08","09","10","11","12"], units: "mg/m³",
    source: "Copernicus Marine — OCEANCOLOUR_GLO_BGC_L4_MY_009_104 (GlobColour 4 km), moyennes mensuelles", method: "Chlorophylle-a de surface, moyenne des 12 mois disponibles de chaque année (mois nuageux exclus)" },
  ph: { layer: "GLOBAL_MULTIYEAR_BGC_001_029/cmems_mod_glo_bgc_my_0.25deg_P1M-m_202406/ph", elevation: "-0.5057600140571594", first: 1993, months: MONTHS, units: "pH",
    source: "Copernicus Marine — GLOBAL_MULTIYEAR_BGC_001_029 (modèle PISCES), moyennes mensuelles", method: "pH de surface (≈0,5 m, valeur modélisée), moyenne des mois de janvier, avril, juillet et octobre" },
};

// Pre-computed real GLORYS values (same method as the live query) for the predefined zones, so charts open instantly.
function cached(kind: CmemsKind, lat: number, lon: number, from: number, to: number): YearPoint[] | null {
  const c = cache as unknown as { lat_lon: Record<string, [number, number]>; series: Record<string, Record<string, [number, number | null, number][]>> };
  const zone = Object.keys(c.lat_lon).find((z) => c.lat_lon[z]![0] === lat && c.lat_lon[z]![1] === lon);
  const rows = zone ? c.series[zone]?.[kind] : undefined;
  if (!rows) return null;
  return rows.filter(([y]) => y >= from && y <= to).map(([year, value, n]) => ({ year, value, n }));
}

const OISST_URL = "https://coastwatch.pfeg.noaa.gov/erddap/griddap/ncdcOisst21Agg_LonPM180";

async function getOisst(lat: number, lon: number, start: number, end: number): Promise<SeriesResult> {
  const from = Math.max(1982, start), to = Math.min(LAST_YEAR, end);
  const base = { units: "°C", source: "NOAA NCEI — OISST v2.1 (AVHRR, 0,25°) via ERDDAP CoastWatch", method: "Température de surface, moyenne annuelle d'un jour échantillonné tous les 30 jours (12 valeurs/an), cellule 0,25° la plus proche", query: `${OISST_URL} · ${lat}°, ${lon}°` };
  if (from > to) return { ...base, points: [], missingYears: [], error: "Ce produit couvre 1982–2025 uniquement" };
  const pre = cached("oisst", lat, lon, from, to);
  if (pre && pre.length === to - from + 1) return { ...base, source: base.source + " — valeurs extraites et enregistrées le " + (cache as { generated: string }).generated, points: pre, missingYears: pre.filter((p) => p.value === null).map((p) => p.year) };
  const la = Math.floor(lat / 0.25) * 0.25 + 0.125, lo = Math.floor(lon / 0.25) * 0.25 + 0.125;
  try {
    const r = await fetch(`${OISST_URL}.csv?sst%5B(${from}-01-15):30:(${to}-12-31)%5D%5B(0)%5D%5B(${la})%5D%5B(${lo})%5D`);
    if (!r.ok) throw new Error(String(r.status));
    const by: Record<number, number[]> = {};
    for (const line of (await r.text()).split("\n").slice(2)) { const c = line.split(","); const v = Number(c[4]); if (c[4] && Number.isFinite(v)) (by[Number(c[0]!.slice(0, 4))] ??= []).push(v); }
    const points: YearPoint[] = [];
    for (let y = from; y <= to; y++) { const v = by[y]; points.push(v?.length ? { year: y, value: Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 1000) / 1000, n: v.length } : { year: y, value: null, n: 0 }); }
    return { ...base, points, missingYears: points.filter((p) => p.value === null).map((p) => p.year) };
  } catch (e) {
    return { ...base, points: [], missingYears: [], error: "Le serveur NOAA ERDDAP n'a pas répondu (" + String(e) + ")" };
  }
}

export async function getCopernicusSeries(kind: CmemsKind, lat: number, lon: number, start: number, end: number): Promise<SeriesResult> {
  if (kind === "oisst") return getOisst(lat, lon, start, end);
  const ex = kind === "sealevel" || kind === "chl" || kind === "ph" ? EXTRA[kind] : null;
  const from = Math.max(ex?.first ?? FIRST_YEAR, start), to = Math.min(LAST_YEAR, end);
  const base = ex ? { units: ex.units, source: ex.source, method: ex.method, query: `${WMTS} · ${ex.layer} · ${lat}°, ${lon}°` } : {
    units: kind === "salinity" ? "PSU" : kind === "temperature" ? "°C" : "m/s",
    source: "Copernicus Marine — GLORYS12V1 (GLOBAL_MULTIYEAR_PHY_001_030), moyennes mensuelles",
    method: kind === "temperature"
      ? "Température de surface (≈0,5 m), moyenne des mois de janvier, avril, juillet et octobre de chaque année"
      : kind === "salinity"
      ? "Salinité de surface (≈0,5 m), moyenne des mois de janvier, avril, juillet et octobre de chaque année"
      : "Vitesse du courant de surface √(u²+v²) (≈0,5 m), moyenne des mois de janvier, avril, juillet et octobre",
    query: `${WMTS} · ${DS} · ${lat}°, ${lon}°`,
  };
  if (from > to) return { ...base, points: [], missingYears: [], error: `Ce produit couvre ${ex?.first ?? FIRST_YEAR}–${LAST_YEAR} uniquement` };
  const pre = cached(kind, lat, lon, from, to);
  if (pre && pre.length === to - from + 1 && !pre.some((p) => p.value !== null)) {
    return { ...base, points: pre, missingYears: pre.map((p) => p.year), error: "Aucune valeur valide en ce point : il est masqué comme côte ou nuages par le produit. Choisissez la zone « côte du Congo » ou « golfe de Guinée »." };
  }
  if (pre && pre.length === to - from + 1) {
    const off = kind === "chl" ? (cache as { chl_offshore_pointe_noire?: [number, number] }).chl_offshore_pointe_noire : undefined;
    if (off && lat === -4.8 && lon === 11.85) base.method += ` — point décalé au large (${off[0]}°, ${off[1]}°, ~25 km) car la bande côtière est masquée par le satellite`;
    return { ...base, source: base.source + " — valeurs extraites et enregistrées le " + (cache as { generated: string }).generated, points: pre, missingYears: pre.filter((p) => p.value === null).map((p) => p.year) };
  }
  const slots: { y: number; m: string }[] = [];
  for (let y = from; y <= to; y++) for (const m of ex?.months ?? MONTHS) slots.push({ y, m });
  const vals = await pool(slots.map((s) => async () => {
    const t = `${s.y}-${s.m}-01`;
    if (ex) return value("", lat, lon, t, ex.layer, ex.elevation);
    if (kind !== "currents") return value(kind === "salinity" ? "so" : "thetao", lat, lon, t);
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
