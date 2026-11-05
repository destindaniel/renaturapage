import { createFileRoute } from "@tanstack/react-router";
import { BarChart3, Satellite } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Archives } from "@/components/sections/ArchivesSection";
import { Compare } from "@/components/sections/CompareSection";
import { Sources } from "@/components/sections/SourcesSection";

const TABS = ["archives", "comparaisons", "sources"] as const;
type Tab = (typeof TABS)[number];
import { Database } from "lucide-react";
import hero from "@/assets/hero-ocean.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Renatura Congo — Données marines du Congo" },
      { name: "description", content: "Mieux connaître notre environnement marin, c'est aussi mieux le protéger. Données scientifiques sur le milieu marin congolais, à explorer, comprendre et partager." },
      { property: "og:title", content: "Renatura Congo — Connaître et protéger le milieu marin congolais" },
      { property: "og:description", content: "Des données scientifiques sur le milieu marin congolais, mises à la disposition de tous pour explorer, comprendre et partager les connaissances sur notre océan." },
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
  return (
    <main>
      <section className="relative overflow-hidden">
        <img src={hero} alt="Océan Atlantique au large de Pointe-Noire" width={1920} height={768} className="absolute inset-0 h-full w-full object-cover" />
        <div className="hero-overlay absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-4 py-20 text-primary-foreground">
          <h1 className="max-w-3xl text-4xl font-extrabold leading-tight md:text-5xl">Mieux connaître notre environnement marin, c'est aussi mieux le protéger.</h1>
          <p className="mt-4 max-w-2xl text-base font-semibold opacity-90 md:text-lg">Cette plateforme rassemble des données scientifiques sur le milieu marin congolais et les met à la disposition de tous pour explorer, comprendre et partager les connaissances sur notre océan.</p>

        </div>
      </section>


      <section id="tableau" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-12">
        <Tabs value={tab} onValueChange={(v) => navigate({ search: { tab: v }, replace: true, resetScroll: false })}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-secondary p-1">
            <TabsTrigger value="archives" className="gap-2 font-bold"><Database className="h-4 w-4" />Données & séries</TabsTrigger>
            <TabsTrigger value="comparaisons" className="gap-2 font-bold"><BarChart3 className="h-4 w-4" />Comparateur</TabsTrigger>
            <TabsTrigger value="sources" className="gap-2 font-bold"><Satellite className="h-4 w-4" />Sources & flux</TabsTrigger>
          </TabsList>
          <div className="-mx-4">
            <TabsContent value="archives"><Archives /></TabsContent>
            <TabsContent value="comparaisons"><Compare /></TabsContent>
            <TabsContent value="sources"><Sources /></TabsContent>
          </div>
        </Tabs>
      </section>
    </main>
  );
}
