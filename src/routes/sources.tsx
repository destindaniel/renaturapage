import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, KeyRound, XCircle } from "lucide-react";
import { PageShell } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { checkSources } from "@/lib/ocean.functions";

export const Route = createFileRoute("/sources")({
  head: () => ({
    meta: [
      { title: "État des sources — Renatur Océan" },
      { name: "description", content: "Test en direct des connexions aux sources scientifiques : NOAA, ERA5, Argo, OpenAlex, Copernicus." },
      { property: "og:title", content: "État des sources — Renatur Océan" },
      { property: "og:description", content: "Quelles sources sont réellement connectées et lesquelles demandent encore des identifiants." },
    ],
  }),
  component: Sources,
});

const PENDING = [
  { name: "Copernicus Marine Service", why: "Compte gratuit requis (identifiant + mot de passe) pour GLORYS, salinité, chlorophylle, pH, niveau de la mer." },
  { name: "Copernicus Data Space Ecosystem", why: "Compte gratuit requis pour les images Sentinel-1/2/3." },
];

function Sources() {
  const q = useQuery({ queryKey: ["sources"], queryFn: () => checkSources(), staleTime: 60_000 });
  return (
    <PageShell title="État des sources" subtitle="Une source n'est affichée comme connectée qu'après un test réussi, effectué maintenant depuis le serveur.">
      <div className="panel p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold">Sources publiques</h2>
          <Button size="sm" variant="outline" onClick={() => q.refetch()} disabled={q.isFetching}>{q.isFetching ? "Test…" : "Relancer le test"}</Button>
        </div>
        {q.isLoading && <p className="text-sm text-muted-foreground">Test des connexions en cours…</p>}
        <ul className="divide-y divide-border">
          {q.data?.tests.map((t) => (
            <li key={t.name} className="flex items-center justify-between py-2 text-sm">
              <span className="flex items-center gap-2 font-semibold">{t.ok ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-destructive" />}{t.name}</span>
              <span className="text-muted-foreground">{t.ok ? `Connectée · ${t.ms} ms` : `Échec (${t.status || "réseau"})`}</span>
            </li>
          ))}
        </ul>
        {q.data && <p className="mt-2 text-xs text-muted-foreground">Dernier test : {new Date(q.data.checkedAt).toLocaleString("fr-FR")}</p>}
      </div>
      <div className="panel mt-4 p-4">
        <h2 className="mb-2 text-lg font-bold">Identifiants à configurer</h2>
        {PENDING.map((p) => (
          <div key={p.name} className="flex gap-2 py-2 text-sm"><KeyRound className="mt-0.5 h-4 w-4 text-warning" /><div><strong>{p.name}</strong> — non connectée. {p.why}</div></div>
        ))}
      </div>
    </PageShell>
  );
}
