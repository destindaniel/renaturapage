import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Satellite } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Archives } from "@/components/sections/ArchivesSection";
import { Compare } from "@/components/sections/CompareSection";
import { Library } from "@/components/sections/LibrarySection";
import { Sources } from "@/components/sections/SourcesSection";

const TABS = ["archives", "comparaisons", "bibliotheque", "sources"] as const;
type Tab = (typeof TABS)[number];
import { Database, Layers, CalendarRange, Radio, Thermometer, Waves, BookOpen } from "lucide-react";
import hero from "@/assets/hero-ocean.jpg";
import temperatureImage from "@/assets/theme-temperature.jpg";
import archivesImage from "@/assets/theme-archives.jpg";
import libraryImage from "@/assets/theme-library.jpg";
import { Button } from "@/components/ui/button";
import { CATEGORIES, DATASETS } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Renatura Congo — Données marines du Congo" },
      { name: "description", content: "Archives, surveillance et bibliothèque océanographique pour Pointe-Noire et le golfe de Guinée." },
      { property: "og:title", content: "Renatura Congo — Données marines du Congo" },
      { property: "og:description", content: "Archives océanographiques depuis 1950, sources scientifiques et bibliothèque pour Pointe-Noire." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { tab?: string } =>
    typeof search["tab"] === "string" ? { tab: search["tab"] } : {},
  component: Index,
});

function Index() {
  const { tab: raw } = Route.useSearch();
  const tab: Tab = (TABS as readonly string[]).includes(raw ?? "") ? (raw as Tab) : "archives";
  const navigate = Route.useNavigate();
  const go = (t: Tab) => {
    navigate({ search: { tab: t }, replace: true, resetScroll: false });
    document.getElementById("tableau")?.scrollIntoView({ behavior: "smooth" });
  };
  const live = DATASETS.filter((d) => d.live).length;
  const stats = [
    { icon: Database, label: "Jeux de données catalogués", value: DATASETS.length, note: `${live} interrogeables en direct` },
    { icon: Layers, label: "Catégories", value: CATEGORIES.length, note: "Physique, biogéochimie, satellite" },
    { icon: CalendarRange, label: "Archive la plus ancienne", value: "1950", note: "Début de recherche (ERSST dès 1854)" },
    { icon: Radio, label: "Sources publiques connectées", value: 4, note: "NOAA · ERA5 · Argo · OpenAlex" },
  ];
  return (
    <main>
      <section className="relative overflow-hidden">
        <img src={hero} alt="Océan Atlantique au large de Pointe-Noire" width={1920} height={768} className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-primary-foreground">
          <h1 className="max-w-2xl text-4xl font-extrabold leading-tight md:text-5xl">Centralisation des données marines du Congo</h1>
          <p className="mt-3 max-w-xl font-semibold opacity-90">Recherche, surveillance et archivage océanographique pour Pointe-Noire et le golfe de Guinée.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button size="lg" onClick={() => go("archives")}>Explorer les données</Button>
            <Button size="lg" variant="outline" onClick={() => go("bibliotheque")} className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              Bibliothèque scientifique
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-8">
        <h2 className="text-2xl font-extrabold text-ocean-deep md:text-3xl">Tableau de bord — Vue générale</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="panel p-4">
              <div className="flex items-center gap-2 text-sm font-bold"><s.icon className="h-4 w-4 text-primary" />{s.label}</div>
              <div className="mt-1 font-display text-3xl font-extrabold text-ocean-deep">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.note}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10">
        <h2 className="text-2xl font-extrabold text-ocean-deep md:text-3xl">Carte — Côte du Congo (Pointe-Noire)</h2>
        <p className="text-muted-foreground">Zone d'étude principale de la plateforme.</p>
        <div className="panel mt-4 overflow-hidden">
          <iframe title="Carte de Pointe-Noire" className="h-72 w-full" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox=10.6%2C-5.6%2C12.6%2C-3.8&layer=mapnik&marker=-4.78%2C11.86" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-10">
        <h2 className="text-2xl font-extrabold text-ocean-deep md:text-3xl">Explorer par thème</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            { icon: Thermometer, image: temperatureImage, alt: "Illustration d’un instrument de mesure océanographique en mer", t: "Température depuis 1950", d: "Série NOAA ERSST v5 au large de Pointe-Noire", to: "comparaisons" as const, tag: "Données réelles" },
            { icon: Waves, image: archivesImage, alt: "Illustration d’un flotteur océanographique à la surface de l’océan", t: "Archives océanographiques", d: "15 produits : vagues, salinité, Argo, satellite…", to: "archives" as const, tag: "Catalogue" },
            { icon: BookOpen, image: libraryImage, alt: "Illustration de publications et d’un microscope de recherche marine", t: "Publications scientifiques", d: "Articles sur le Congo et le golfe de Guinée", to: "bibliotheque" as const, tag: "OpenAlex" },
          ].map((c) => (
            <Button type="button" variant="ghost" key={c.t} onClick={() => go(c.to)} className="panel block h-full overflow-hidden p-0 text-left whitespace-normal transition hover:-translate-y-0.5 hover:bg-card">
              <img src={c.image} alt={c.alt} loading="lazy" width={1088} height={608} className="aspect-video w-full object-cover" />
              <div className="p-5">
              <c.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-3 text-lg font-bold">{c.t}</h3>
              <p className="text-sm text-muted-foreground">{c.d}</p>
              <span className="mt-3 inline-block rounded bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">{c.tag}</span>
              </div>
            </Button>
          ))}
        </div>
      </section>

      <section id="tableau" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-12">
        <Tabs value={tab} onValueChange={(v) => navigate({ search: { tab: v }, replace: true, resetScroll: false })}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-secondary p-1">
            <TabsTrigger value="archives" className="gap-2 font-bold"><Database className="h-4 w-4" />Données & séries</TabsTrigger>
            <TabsTrigger value="comparaisons" className="gap-2 font-bold"><BarChart3 className="h-4 w-4" />Comparateur</TabsTrigger>
            <TabsTrigger value="bibliotheque" className="gap-2 font-bold"><BookOpen className="h-4 w-4" />Bibliothèque</TabsTrigger>
            <TabsTrigger value="sources" className="gap-2 font-bold"><Satellite className="h-4 w-4" />Sources & flux</TabsTrigger>
          </TabsList>
          <div className="-mx-4">
            <TabsContent value="archives"><Archives /></TabsContent>
            <TabsContent value="comparaisons"><Compare /></TabsContent>
            <TabsContent value="bibliotheque"><Library /></TabsContent>
            <TabsContent value="sources"><Sources /></TabsContent>
          </div>
        </Tabs>
      </section>
    </main>
  );
}
