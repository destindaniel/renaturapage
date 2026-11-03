// Catalogue of real, documented ocean data products relevant to Pointe-Noire / Congo / Gulf of Guinea.
// Metadata (start years, resolution, units) comes from each provider's official product page.
// `live` names a server fetcher that returns real values; products without it are catalogue entries only.

export type DataType = "observation" | "satellite" | "reanalyse" | "modele" | "prevision";
export type Access = "libre" | "identifiants";
export type LiveKey = "ersst" | "waves" | "argo" | "salinity" | "currents" | "temperature" | "sealevel" | "chl" | "ph" | "oisst" | null;

export interface Dataset {
  id: string;
  name: string;
  category: string;
  start: number; // real first year available
  end: string; // "présent" or year
  area: string;
  source: string;
  type: DataType;
  units: string;
  frequency: string;
  resolution: string;
  depth: string | null;
  quality: "contrôlée" | "préliminaire" | "temps quasi réel";
  access: Access;
  live: LiveKey;
  url: string;
  downloadUrl?: string;
  updated: string;
  description: string;
  limits: string;
  keywords: string[];
}

export const CATEGORIES = [
  "Température de surface de la mer",
  "Température océanique en profondeur",
  "Salinité",
  "Courants marins",
  "Hauteur des vagues",
  "Niveau de la mer",
  "Chlorophylle-a et biogéochimie",
  "Acidification et pH",
  "Observations satellitaires",
  "Profils Argo",
  "Données côtières et environnementales",
  "Pollution marine",
] as const;

export const TYPE_LABEL: Record<DataType, string> = {
  observation: "Observation directe",
  satellite: "Satellite",
  reanalyse: "Réanalyse",
  modele: "Modèle",
  prevision: "Prévision",
};

export const ZONES = {
  "pointe-noire": { label: "Pointe-Noire", lat: -4.8, lon: 11.85, bbox: [-6, 10.5, -3.5, 12.5] },
  congo: { label: "Côte de la République du Congo", lat: -4.5, lon: 11.3, bbox: [-6, 9, -3, 12.5] },
  guinee: { label: "Golfe de Guinée", lat: -1, lon: 5, bbox: [-8, -5, 6, 12] },
} as const;
export type ZoneKey = keyof typeof ZONES | "custom";

const CMEMS = "Copernicus Marine Service";

export const DATASETS: Dataset[] = [
  {
    id: "noaa-ersst-v5",
    name: "NOAA ERSST v5 — Température de surface mensuelle",
    category: "Température de surface de la mer",
    start: 1854, end: "présent", area: "Global (grille 2°)", source: "NOAA NCEI",
    type: "reanalyse", units: "°C", frequency: "Mensuelle", resolution: "2° × 2°", depth: "Surface",
    quality: "contrôlée", access: "libre", live: "ersst",
    url: "https://www.ncei.noaa.gov/products/extended-reconstructed-sst",
    downloadUrl: "https://coastwatch.pfeg.noaa.gov/erddap/griddap/nceiErsstv5.html",
    updated: "Mensuelle (NOAA)",
    description: "Reconstruction de la température de surface à partir des navires, bouées et flotteurs (ICOADS), avec interpolation statistique.",
    limits: "Grille grossière de 2° : la valeur représente une large zone au large de Pointe-Noire, pas la température côtière locale. Avant 1950, les observations dans le golfe de Guinée sont rares.",
    keywords: ["sst", "température", "climat", "anomalie"],
  },
  {
    id: "noaa-oisst",
    name: "NOAA OISST v2.1 — Température de surface journalière",
    category: "Température de surface de la mer",
    start: 1981, end: "présent", area: "Global", source: "NOAA NCEI",
    type: "satellite", units: "°C", frequency: "Journalière", resolution: "0,25°", depth: "Surface",
    quality: "contrôlée", access: "libre", live: "oisst",
    url: "https://www.ncei.noaa.gov/products/optimum-interpolation-sst",
    downloadUrl: "https://www.ncei.noaa.gov/data/sea-surface-temperature-optimum-interpolation/v2.1/access/avhrr/",
    updated: "Journalière", description: "Analyse combinant capteurs satellitaires AVHRR et observations in situ.",
    limits: "Commence en septembre 1981 (début de l'ère satellitaire AVHRR). Fichiers NetCDF globaux volumineux.",
    keywords: ["sst", "avhrr", "satellite"],
  },
  {
    id: "cmems-glorys12",
    name: "GLORYS12V1 — Réanalyse physique globale",
    category: "Température océanique en profondeur",
    start: 1993, end: "présent", area: "Global", source: CMEMS,
    type: "reanalyse", units: "°C, PSU, m/s", frequency: "Journalière / mensuelle", resolution: "1/12° (~8 km)", depth: "0–5 700 m (50 niveaux)",
    quality: "contrôlée", access: "libre", live: "temperature",
    url: "https://data.marine.copernicus.eu/product/GLOBAL_MULTIYEAR_PHY_001_030/description",
    downloadUrl: "https://data.marine.copernicus.eu/product/GLOBAL_MULTIYEAR_PHY_001_030/download",
    updated: "Mise à jour annuelle + intérim", description: "Température, salinité, courants et hauteur de mer issus du modèle NEMO assimilant les observations.",
    limits: "Débute en 1993. Courbe affichée : température de surface, 4 mois par an ; les autres profondeurs restent sur le portail Copernicus.",
    keywords: ["température", "salinité", "courants", "profondeur", "nemo"],
  },
  {
    id: "cmems-glorys-sal",
    name: "GLORYS12V1 — Salinité",
    category: "Salinité",
    start: 1993, end: "présent", area: "Global", source: CMEMS,
    type: "reanalyse", units: "PSU", frequency: "Journalière / mensuelle", resolution: "1/12°", depth: "0–5 700 m",
    quality: "contrôlée", access: "libre", live: "salinity",
    url: "https://data.marine.copernicus.eu/product/GLOBAL_MULTIYEAR_PHY_001_030/description",
    downloadUrl: "https://data.marine.copernicus.eu/product/GLOBAL_MULTIYEAR_PHY_001_030/download",
    updated: "Annuelle", description: "Salinité modélisée et assimilée — utile pour suivre le panache du fleuve Congo.",
    limits: "Le panache du Congo est mal résolu près de l'embouchure. Série affichée : surface, 4 mois par an.",
    keywords: ["salinité", "panache", "fleuve congo"],
  },
  {
    id: "cmems-glorys-currents",
    name: "GLORYS12V1 — Courants",
    category: "Courants marins",
    start: 1993, end: "présent", area: "Global", source: CMEMS,
    type: "reanalyse", units: "m/s", frequency: "Journalière / mensuelle", resolution: "1/12°", depth: "0–5 700 m",
    quality: "contrôlée", access: "libre", live: "currents",
    url: "https://data.marine.copernicus.eu/product/GLOBAL_MULTIYEAR_PHY_001_030/description",
    downloadUrl: "https://data.marine.copernicus.eu/product/GLOBAL_MULTIYEAR_PHY_001_030/download",
    updated: "Annuelle", description: "Composantes est (uo) et nord (vo) du courant, réanalyse avec assimilation de données.",
    limits: "Vitesse calculée à partir des moyennes mensuelles : les courants ponctuels et les marées ne sont pas représentés. Série affichée : surface, 4 mois par an.",
    keywords: ["courants", "réanalyse", "glorys"],
  },
  {
    id: "era5-ocean-waves",
    name: "ERA5 — Hauteur significative des vagues",
    category: "Hauteur des vagues",
    start: 1940, end: "présent (−5 j)", area: "Global", source: "ECMWF / Copernicus C3S (via Open-Meteo)",
    type: "reanalyse", units: "m", frequency: "Horaire (agrégée)", resolution: "0,5°", depth: "Surface",
    quality: "contrôlée", access: "libre", live: "waves",
    url: "https://cds.climate.copernicus.eu/datasets/reanalysis-era5-single-levels",
    downloadUrl: "https://open-meteo.com/en/docs/marine-weather-api",
    updated: "Quotidienne", description: "Vagues issues de la réanalyse atmosphérique ERA5 couplée au modèle de vagues WAM.",
    limits: "Résolution de 0,5° : la houle côtière et les déferlements locaux ne sont pas représentés. Avant l'ère satellitaire (1979) les incertitudes sont plus grandes.",
    keywords: ["vagues", "houle", "era5"],
  },
  {
    id: "cmems-sealevel",
    name: "Niveau de la mer altimétrique (DUACS)",
    category: "Niveau de la mer",
    start: 1993, end: "présent", area: "Global", source: CMEMS,
    type: "satellite", units: "m", frequency: "Journalière", resolution: "0,125°", depth: "Surface",
    quality: "contrôlée", access: "identifiants", live: "sealevel",
    url: "https://data.marine.copernicus.eu/product/SEALEVEL_GLO_PHY_L4_MY_008_047/description",
    downloadUrl: "https://data.marine.copernicus.eu/product/SEALEVEL_GLO_PHY_L4_MY_008_047/download",
    updated: "Annuelle + NRT", description: "Anomalies de hauteur de mer issues des altimètres satellitaires multi-missions.",
    limits: "Débute en 1993 (TOPEX/Poseidon). Peu fiable à moins de ~20 km de la côte.",
    keywords: ["niveau de la mer", "altimétrie", "sla"],
  },
  {
    id: "cmems-oc-chl",
    name: "Chlorophylle-a — couleur de l'océan (GlobColour)",
    category: "Chlorophylle-a et biogéochimie",
    start: 1997, end: "présent", area: "Global", source: CMEMS,
    type: "satellite", units: "mg/m³", frequency: "Journalière / mensuelle", resolution: "4 km", depth: "Surface",
    quality: "contrôlée", access: "identifiants", live: "chl",
    url: "https://data.marine.copernicus.eu/product/OCEANCOLOUR_GLO_BGC_L4_MY_009_104/description",
    downloadUrl: "https://data.marine.copernicus.eu/product/OCEANCOLOUR_GLO_BGC_L4_MY_009_104/download",
    updated: "Quotidienne", description: "Fusion des capteurs SeaWiFS, MODIS, MERIS, VIIRS, OLCI.",
    limits: "Débute en septembre 1997 (SeaWiFS). Eaux côtières turbides (panache du Congo) : surestimation fréquente ; couverture nuageuse importante.",
    keywords: ["chlorophylle", "phytoplancton", "couleur de l'océan"],
  },
  {
    id: "cmems-bgc-ph",
    name: "Biogéochimie globale — pH et carbonates (réanalyse)",
    category: "Acidification et pH",
    start: 1993, end: "présent", area: "Global", source: CMEMS,
    type: "modele", units: "pH, mol/m³", frequency: "Mensuelle", resolution: "0,25°", depth: "0–5 700 m",
    quality: "contrôlée", access: "identifiants", live: "ph",
    url: "https://data.marine.copernicus.eu/product/GLOBAL_MULTIYEAR_BGC_001_029/description",
    downloadUrl: "https://data.marine.copernicus.eu/product/GLOBAL_MULTIYEAR_BGC_001_029/download",
    updated: "Annuelle", description: "Modèle PISCES : pH, DIC, alcalinité, oxygène, nutriments.",
    limits: "Valeurs modélisées : aucune série de mesure directe de pH n'est disponible publiquement pour Pointe-Noire.",
    keywords: ["ph", "acidification", "oxygène", "pisces"],
  },
  {
    id: "argo-gdac",
    name: "Profils des flotteurs Argo (GDAC Ifremer)",
    category: "Profils Argo",
    start: 1999, end: "présent", area: "Golfe de Guinée / Atlantique", source: "Programme Argo (Ifremer ERDDAP)",
    type: "observation", units: "°C, PSU, dbar", frequency: "Profil tous les ~10 jours", resolution: "Point", depth: "0–2 000 m",
    quality: "temps quasi réel", access: "libre", live: "argo",
    url: "https://argo.ucsd.edu/data/",
    downloadUrl: "https://erddap.ifremer.fr/erddap/tabledap/ArgoFloats.html",
    updated: "Quotidienne", description: "Mesures in situ de température et salinité par flotteurs autonomes.",
    limits: "Déploiement global effectif à partir de 2000–2005 ; très peu de flotteurs sur le plateau congolais (profondeur < 2 000 m).",
    keywords: ["argo", "profil", "in situ", "salinité"],
  },
];

export interface Filters {
  q: string;
  category: string;
  source: string;
  type: string;
  start: number;
  end: number;
  depth: "" | "surface" | "profondeur";
  quality: string;
  access: string;
}

export const CURRENT_YEAR = new Date().getFullYear();
export const DEFAULT_FILTERS: Filters = { q: "", category: "", source: "", type: "", start: 1950, end: CURRENT_YEAR, depth: "", quality: "", access: "" };

const endYear = (d: Dataset) => (/^\d{4}$/.test(d.end) ? Number(d.end) : CURRENT_YEAR);

export function filterDatasets(list: Dataset[], f: Filters): Dataset[] {
  const q = f.q.trim().toLowerCase();
  return list.filter((d) => {
    if (f.category && d.category !== f.category) return false;
    if (f.source && d.source !== f.source) return false;
    if (f.type && d.type !== f.type) return false;
    if (f.quality && d.quality !== f.quality) return false;
    if (f.access && d.access !== f.access) return false;
    // period overlap
    if (d.start > f.end || endYear(d) < f.start) return false;
    if (f.depth === "surface" && d.depth !== "Surface") return false;
    if (f.depth === "profondeur" && (!d.depth || d.depth === "Surface")) return false;
    if (q) {
      const hay = [d.name, d.category, d.source, d.description, ...d.keywords].join(" ").toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export const SOURCES = Array.from(new Set(DATASETS.map((d) => d.source)));
