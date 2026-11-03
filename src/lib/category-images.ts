import sst from "@/assets/cat-sst.jpg";
import deep from "@/assets/cat-deep.jpg";
import salinity from "@/assets/cat-salinity.jpg";
import currents from "@/assets/cat-currents.jpg";
import waves from "@/assets/cat-waves.jpg";
import sealevel from "@/assets/cat-sealevel.jpg";
import chl from "@/assets/cat-chl.jpg";
import ph from "@/assets/cat-ph.jpg";
import argo from "@/assets/cat-argo.jpg";

// Illustrative photo per data category (decorative, not data).
export const CATEGORY_IMAGES: Record<string, string> = {
  "Température de surface de la mer": sst,
  "Température océanique en profondeur": deep,
  "Salinité": salinity,
  "Courants marins": currents,
  "Hauteur des vagues": waves,
  "Niveau de la mer": sealevel,
  "Chlorophylle-a et biogéochimie": chl,
  "Acidification et pH": ph,
  "Profils Argo": argo,
};
