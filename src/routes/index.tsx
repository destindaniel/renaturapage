import { createFileRoute, Link } from "@tanstack/react-router";
import { Database, Layers, CalendarRange, Radio, Thermometer, Waves, BookOpen } from "lucide-react";
import hero from "@/assets/hero-ocean.jpg";
import { Button } from "@/components/ui/button";
import { CATEGORIES, DATASETS } from "@/lib/catalog";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Renatur Océan — Données marines du Congo" },
      { name: "description", content: "Archives, surveillance et bibliothèque océanographique pour Pointe-Noire et le golfe de Guinée." },
      { property: "og:title", content: "Renatur Océan — Données marines du Congo" },
      { property: "og:description", content: "Archives océanographiques depuis 1950, sources scientifiques et bibliothèque pour Pointe-Noire." },
    ],
  }),
  component: Index,
});

function Index() {
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
            <Button asChild size="lg"><Link to="/archives">Explorer les données</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <Link to="/bibliotheque">Bibliothèque scientifique</Link>
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
            { icon: Thermometer, t: "Température depuis 1950", d: "Série NOAA ERSST v5 au large de Pointe-Noire", to: "/comparaisons" as const, tag: "Données réelles" },
            { icon: Waves, t: "Archives océanographiques", d: "15 produits : vagues, salinité, Argo, satellite…", to: "/archives" as const, tag: "Catalogue" },
            { icon: BookOpen, t: "Publications scientifiques", d: "Articles sur le Congo et le golfe de Guinée", to: "/bibliotheque" as const, tag: "OpenAlex" },
          ].map((c) => (
            <Link key={c.t} to={c.to} className="panel block p-5 transition hover:-translate-y-0.5">
              <c.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-3 text-lg font-bold">{c.t}</h3>
              <p className="text-sm text-muted-foreground">{c.d}</p>
              <span className="mt-3 inline-block rounded bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">{c.tag}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
