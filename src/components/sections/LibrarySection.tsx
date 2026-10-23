import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { ExternalLink, FileText, RotateCcw, Search } from "lucide-react";
import { PageShell } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CURRENT_YEAR } from "@/lib/catalog";
import { searchLiterature } from "@/lib/ocean.functions";
import { searchLiteratureInBrowser, type LitQuery, type Work } from "@/lib/openalex";

// Browser first (visitor's own OpenAlex quota), server as fallback.
async function fetchLiterature(f: LitQuery) {
  try {
    const r = await searchLiteratureInBrowser(f);
    if (!r.error) return r;
  } catch { /* network/CORS: fall back to server */ }
  return searchLiterature({ data: f });
}

const THEMES = ["", "upwelling", "fisheries", "sea surface temperature", "Congo river plume", "mangrove", "marine turtles", "oil pollution", "coastal erosion", "plankton"];
const DEFAULT = { q: "", theme: "", fromYear: 1950, toYear: CURRENT_YEAR, oaOnly: false, type: "", page: 1 };
const sel = "h-9 rounded-md border border-input bg-card px-2 text-sm";

export function Library() {
  const [draft, setDraft] = useState("");
  const [f, setF] = useState(DEFAULT);
  const q = useQuery({ queryKey: ["lit", f], queryFn: () => fetchLiterature(f), staleTime: 600_000, placeholderData: keepPreviousData });

  return (
    <PageShell title="Bibliothèque scientifique" subtitle="Publications sur Pointe-Noire, le Congo, l'Afrique centrale et le golfe de Guinée (catalogue OpenAlex). Les PDF ne sont proposés que lorsqu'une version en accès libre est référencée.">
      <form className="panel grid gap-3 p-4 md:grid-cols-4" onSubmit={(e) => { e.preventDefault(); setF({ ...f, q: draft, page: 1 }); }}>
        <label className="relative md:col-span-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Titre, auteur, mot-clé (en anglais ou en français)…" value={draft} onChange={(e) => setDraft(e.target.value)} />
        </label>
        <Button type="submit">Rechercher</Button>
        <Button type="button" variant="outline" onClick={() => { setDraft(""); setF(DEFAULT); }}><RotateCcw className="h-4 w-4" />Réinitialiser</Button>
        <select className={sel} value={f.theme} onChange={(e) => setF({ ...f, theme: e.target.value, page: 1 })} aria-label="Thème">
          {THEMES.map((t) => <option key={t} value={t}>{t || "Tous thèmes"}</option>)}
        </select>
        <select className={sel} value={f.type} onChange={(e) => setF({ ...f, type: e.target.value, page: 1 })} aria-label="Type">
          <option value="">Tous types</option><option value="article">Article</option><option value="report">Rapport</option><option value="book-chapter">Chapitre</option><option value="dissertation">Thèse</option><option value="dataset">Jeu de données</option>
        </select>
        <div className="flex items-center gap-2 text-sm">
          <Input type="number" value={f.fromYear} onChange={(e) => setF({ ...f, fromYear: Number(e.target.value) || 1950, page: 1 })} aria-label="Année début" />
          <span>→</span>
          <Input type="number" value={f.toYear} onChange={(e) => setF({ ...f, toYear: Number(e.target.value) || CURRENT_YEAR, page: 1 })} aria-label="Année fin" />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={f.oaOnly} onChange={(e) => setF({ ...f, oaOnly: e.target.checked, page: 1 })} />Accès libre uniquement
        </label>
      </form>

      <div className="mt-4 text-sm">
        {q.isFetching ? "Recherche en cours…" : q.data?.error ? <span className="text-destructive">{q.data.error}. Réessayez dans un instant.</span> : <strong>{q.data?.count.toLocaleString("fr-FR")} publications</strong>}
      </div>

      {q.data && q.data.works.length === 0 && !q.isFetching && !q.data.error && <div className="panel mt-4 p-8 text-center text-muted-foreground">Aucune publication ne correspond. Essayez un terme plus général.</div>}

      <div className="mt-4 grid gap-4">
        {q.data?.works.map((w) => <WorkCard key={w.id} w={w} />)}
      </div>

      {q.data && q.data.count > 20 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <Button variant="outline" disabled={f.page === 1} onClick={() => setF({ ...f, page: f.page - 1 })}>Précédent</Button>
          <span className="text-sm">Page {f.page}</span>
          <Button variant="outline" disabled={f.page * 20 >= q.data.count || f.page >= 50} onClick={() => setF({ ...f, page: f.page + 1 })}>Suivant</Button>
        </div>
      )}
    </PageShell>
  );
}

function WorkCard({ w }: { w: Work }) {
  const [more, setMore] = useState(false);
  return (
    <article className="panel flex gap-4 p-4">
      <div className="hidden h-28 w-20 shrink-0 flex-col items-center justify-center rounded bg-secondary text-secondary-foreground sm:flex">
        <FileText className="h-8 w-8" /><span className="mt-1 text-xs font-bold">{w.year ?? "—"}</span>
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="font-bold leading-snug">{w.title}</h3>
        <p className="text-xs text-muted-foreground">{w.authors.join(", ") || "Auteurs non renseignés"} · {w.year ?? "s.d."} · {w.source ?? "Source inconnue"} · {w.type ?? ""} · {w.language?.toUpperCase() ?? ""}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {w.pdf ? <span className="rounded bg-success/15 px-2 py-0.5 text-xs font-bold text-success">PDF en accès libre{w.license ? ` · ${w.license}` : ""}</span>
            : w.isOa ? <span className="rounded bg-secondary px-2 py-0.5 text-xs font-bold">Accès libre (page éditeur)</span>
            : <span className="rounded bg-muted px-2 py-0.5 text-xs font-bold text-muted-foreground">Résumé / lien éditeur seulement</span>}
          {w.concepts.map((c) => <span key={c} className="rounded bg-muted px-2 py-0.5 text-xs">{c}</span>)}
        </div>
        {w.abstract && <p className="mt-2 text-sm text-muted-foreground">{more ? w.abstract : w.abstract.slice(0, 260) + (w.abstract.length > 260 ? "…" : "")} {w.abstract.length > 260 && <button className="font-bold text-primary" onClick={() => setMore(!more)}>{more ? "moins" : "lire plus"}</button>}</p>}
        <div className="mt-3 flex flex-wrap gap-2">
          {w.pdf && <Button size="sm" asChild><a href={w.pdf} target="_blank" rel="noreferrer"><FileText className="h-4 w-4" />Ouvrir le PDF</a></Button>}
          {w.landing && <Button size="sm" variant="outline" asChild><a href={w.landing} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" />Page officielle</a></Button>}
          {w.doi && <span className="self-center text-xs text-muted-foreground">DOI : {w.doi.replace("https://doi.org/", "")}</span>}
        </div>
      </div>
    </article>
  );
}
