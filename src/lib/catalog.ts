// Catalogue of real, documented ocean data products relevant to Pointe-Noire / Congo / Gulf of Guinea.
// Metadata (start years, resolution, units) comes from each provider's official product page.
// `live` names a server fetcher that returns real values; products without it are catalogue entries only.

export type DataType = "observation" | "satellite" | "reanalyse" | "modele" | "prevision";
export type Access = "libre" | "identifiants";
export type LiveKey = "ersst" | "waves" | "argo" | null;

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
    quality: "contrôlée", access: "libre", live: null,
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
    quality: "contrôlée", access: "identifiants", live: null,
    url: "https://data.marine.copernicus.eu/product/GLOBAL_MULTIYEAR_PHY_001_030/description",
    updated: "Mise à jour annuelle + intérim", description: "Température, salinité, courants et hauteur de mer issus du modèle NEMO assimilant les observations.",
    limits: "Débute en 1993. Accès via compte Copernicus Marine gratuit (non configuré ici).",
    keywords: ["température", "salinité", "courants", "profondeur", "nemo"],
  },
  {
    id: "cmems-glorys-sal",
    name: "GLORYS12V1 — Salinité",
    category: "Salinité",
    start: 1993, end: "présent", area: "Global", source: CMEMS,
    type: "reanalyse", units: "PSU", frequency: "Journalière / mensuelle", resolution: "1/12°", depth: "0–5 700 m",
    quality: "contrôlée", access: "identifiants", live: null,
    url: "https://data.marine.copernicus.eu/product/GLOBAL_MULTIYEAR_PHY_001_030/description",
    updated: "Annuelle", description: "Salinité modélisée et assimilée — utile pour suivre le panache du fleuve Congo.",
    limits: "Le panache du Congo est mal résolu près de l'embouchure. Compte Copernicus requis.",
    keywords: ["salinité", "panache", "fleuve congo"],
  },
  {
    id: "cmems-currents-nrt",
    name: "Analyse et prévision physique globale (courants)",
    category: "Courants marins",
    start: 2020, end: "présent + 10 j", area: "Global", source: CMEMS,
    type: "prevision", units: "m/s", frequency: "Horaire / journalière", resolution: "1/12°", depth: "0–5 700 m",
    quality: "temps quasi réel", access: "identifiants", live: null,
    url: "https://data.marine.copernicus.eu/product/GLOBAL_ANALYSISFORECAST_PHY_001_024/description",
    updated: "Quotidienne", description: "Analyse et prévision à 10 jours des courants, températures et salinité.",
    limits: "Archive glissante limitée ; pour l'historique utiliser GLORYS. Compte requis.",
    keywords: ["courants", "prévision"],
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
    quality: "contrôlée", access: "identifiants", live: null,
    url: "https://data.marine.copernicus.eu/product/SEALEVEL_GLO_PHY_L4_MY_008_047/description",
    updated: "Annuelle + NRT", description: "Anomalies de hauteur de mer issues des altimètres satellitaires multi-missions.",
    limits: "Débute en 1993 (TOPEX/Poseidon). Peu fiable à moins de ~20 km de la côte.",
    keywords: ["niveau de la mer", "altimétrie", "sla"],
  },
  {
    id: "psmsl-tide",
    name: "PSMSL — Marégraphes (Afrique centrale)",
    category: "Niveau de la mer",
    start: 1950, end: "variable selon station", area: "Stations côtières", source: "PSMSL",
    type: "observation", units: "mm", frequency: "Mensuelle / annuelle", resolution: "Station", depth: null,
    quality: "contrôlée", access: "libre", live: null,
    url: "https://psmsl.org/data/obtaining/",
    updated: "Variable", description: "Séries marégraphiques du Permanent Service for Mean Sea Level.",
    limits: "Aucune série longue continue n'est publiée pour Pointe-Noire ; les stations voisines ont de nombreuses lacunes. Vérifier la couverture station par station.",
    keywords: ["marégraphe", "niveau de la mer"],
  },
  {
    id: "cmems-oc-chl",
    name: "Chlorophylle-a — couleur de l'océan (GlobColour)",
    category: "Chlorophylle-a et biogéochimie",
    start: 1997, end: "présent", area: "Global", source: CMEMS,
    type: "satellite", units: "mg/m³", frequency: "Journalière / mensuelle", resolution: "4 km", depth: "Surface",
    quality: "contrôlée", access: "identifiants", live: null,
    url: "https://data.marine.copernicus.eu/product/OCEANCOLOUR_GLO_BGC_L4_MY_009_104/description",
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
    quality: "contrôlée", access: "identifiants", live: null,
    url: "https://data.marine.copernicus.eu/product/GLOBAL_MULTIYEAR_BGC_001_029/description",
    updated: "Annuelle", description: "Modèle PISCES : pH, DIC, alcalinité, oxygène, nutriments.",
    limits: "Valeurs modélisées : aucune série de mesure directe de pH n'est disponible publiquement pour Pointe-Noire.",
    keywords: ["ph", "acidification", "oxygène", "pisces"],
  },
  {
    id: "sentinel-cdse",
    name: "Sentinel-1 / 2 / 3 — imagerie satellitaire",
    category: "Observations satellitaires",
    start: 2014, end: "présent", area: "Global", source: "Copernicus Data Space Ecosystem",
    type: "satellite", units: "Réflectance, rétrodiffusion", frequency: "1–6 jours", resolution: "10 m – 300 m", depth: "Surface",
    quality: "contrôlée", access: "identifiants", live: null,
    url: "https://dataspace.copernicus.eu/explore-data",
    updated: "Continue", description: "Radar Sentinel-1 (nappes d'hydrocarbures, navires), optique Sentinel-2 (littoral), Sentinel-3 OLCI/SLSTR (couleur, température).",
    limits: "Sentinel-1 depuis 2014, Sentinel-2 depuis 2015, Sentinel-3 depuis 2016. Compte CDSE requis pour le téléchargement.",
    keywords: ["sentinel", "imagerie", "radar", "littoral"],
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
  {
    id: "icoads",
    name: "ICOADS — Observations marines de navires",
    category: "Données côtières et environnementales",
    start: 1662, end: "présent", area: "Global", source: "NOAA NCEI",
    type: "observation", units: "Variables multiples", frequency: "Irrégulière", resolution: "Point / 1°", depth: "Surface",
    quality: "contrôlée", access: "libre", live: null,
    url: "https://www.ncei.noaa.gov/products/international-comprehensive-ocean-atmosphere",
    updated: "Mensuelle", description: "Base mondiale des observations météo-marines de navires, bouées et plateformes.",
    limits: "Densité d'observations très faible au large du Congo avant 1960.",
    keywords: ["navires", "météo marine", "historique"],
  },
  {
    id: "wod",
    name: "World Ocean Database — profils historiques",
    category: "Température océanique en profondeur",
    start: 1950, end: "présent", area: "Global", source: "NOAA NCEI",
    type: "observation", units: "°C, PSU, O₂, nutriments", frequency: "Irrégulière", resolution: "Profil", depth: "0 – fond",
    quality: "contrôlée", access: "libre", live: null,
    url: "https://www.ncei.noaa.gov/products/world-ocean-database",
    downloadUrl: "https://www.ncei.noaa.gov/access/world-ocean-database-select/dbsearch.html",
    updated: "Trimestrielle", description: "Archive de profils CTD, XBT, bouteilles (données depuis le XVIIIᵉ siècle ; ici bornée à 1950).",
    limits: "Couverture inégale : campagnes ORSTOM des années 1950–1980 au large de Pointe-Noire, peu de données ensuite.",
    keywords: ["ctd", "xbt", "orstom", "profil"],
  },
  {
    id: "emodnet-litter",
    name: "Déchets marins et marées noires — détection Sentinel-1",
    category: "Pollution marine",
    start: 2014, end: "présent", area: "Golfe de Guinée", source: "Copernicus Data Space Ecosystem",
    type: "satellite", units: "Détections (km²)", frequency: "Selon passage", resolution: "10 m", depth: "Surface",
    quality: "préliminaire", access: "identifiants", live: null,
    url: "https://dataspace.copernicus.eu/",
    updated: "Continue", description: "Imagerie radar permettant l'identification de nappes suspectes (hydrocarbures).",
    limits: "Aucun jeu de données public de mesures de pollution validées n'existe pour Pointe-Noire : seule l'imagerie brute est disponible ; l'interprétation nécessite un expert.",
    keywords: ["pollution", "hydrocarbures", "nappes"],
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
