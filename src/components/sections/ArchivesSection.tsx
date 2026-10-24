import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Eye, RotateCcw, Search } from "lucide-react";
import { PageShell } from "@/components/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { SeriesChart } from "@/components/SeriesChart";
import {
  CATEGORIES, CURRENT_YEAR, DATASETS, DEFAULT_FILTERS, SOURCES, TYPE_LABEL, ZONES,
  filterDatasets, type Dataset, type Filters, type ZoneKey,
} from "@/lib/catalog";
import { getArgoProfiles, getSstSeries } from "@/lib/ocean.functions";
import { getWaves as getWaveSeries } from "@/lib/browser-sources";


const sel = "h-9 rounded-md border border-input bg-card px-2 text-sm";

export function Archives() {
  const [f, setF] = useState<Filters>(DEFAULT_FILTERS);
  const [zone, setZone] = useState<ZoneKey>("pointe-noire");
  const [custom, setCustom] = useState({ lat: -4.8, lon: 11.5 });
  const [open, setOpen] = useState<Dataset | null>(null);
  const results = useMemo(() => filterDatasets(DATASETS, f), [f]);
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((p) => ({ ...p, [k]: v }));
  const point = zone === "custom" ? custom : ZONES[zone];
  const active = (Object.keys(f) as (keyof Filters)[]).filter((k) => f[k] !== DEFAULT_FILTERS[k]);
  const years = results.length ? `${Math.min(...results.map((r) => r.start))} – présent` : "—";

  return (
    <PageShell title="Archives océanographiques" subtitle="Recherche de 1950 à la dernière période disponible. Chaque produit affiche sa véritable première année : aucune valeur n'est inventée pour combler les lacunes.">
      <div className="panel grid gap-3 p-4 md:grid-cols-4">
        <label className="relative md:col-span-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Mot-clé (ex. salinité, argo, houle)…" value={f.q} onChange={(e) => set("q", e.target.value)} />
        </label>
        <select className={sel} value={f.category} onChange={(e) => set("category", e.target.value)} aria-label="Catégorie">
          <option value="">Toutes catégories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={sel} value={f.source} onChange={(e) => set("source", e.target.value)} aria-label="Source">
          <option value="">Toutes sources</option>
          {SOURCES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className={sel} value={f.type} onChange={(e) => set("type", e.target.value)} aria-label="Type">
          <option value="">Tous types</option>
          {Object.entries(TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className={sel} value={f.depth} onChange={(e) => set("depth", e.target.value as Filters["depth"])} aria-label="Profondeur">
          <option value="">Toutes profondeurs</option><option value="surface">Surface uniquement</option><option value="profondeur">Colonne d'eau</option>
        </select>
        <select className={sel} value={f.quality} onChange={(e) => set("quality", e.target.value)} aria-label="Qualité">
          <option value="">Toute qualité</option><option>contrôlée</option><option>temps quasi réel</option><option>préliminaire</option>
        </select>
        <select className={sel} value={f.access} onChange={(e) => set("access", e.target.value)} aria-label="Accès">
          <option value="">Tout accès</option><option value="libre">Accès libre</option><option value="identifiants">Compte requis</option>
        </select>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-bold">Du</span>
          <Input type="number" min={1950} max={CURRENT_YEAR} value={f.start} onChange={(e) => set("start", Number(e.target.value) || 1950)} />
          <span className="font-bold">au</span>
          <Input type="number" min={1950} max={CURRENT_YEAR} value={f.end} onChange={(e) => set("end", Number(e.target.value) || CURRENT_YEAR)} />
        </div>
        <select className={sel} value={zone} onChange={(e) => setZone(e.target.value as ZoneKey)} aria-label="Zone">
          {Object.entries(ZONES).map(([k, z]) => <option key={k} value={k}>{z.label}</option>)}
          <option value="custom">Zone personnalisée</option>
        </select>
        {zone === "custom" && (
          <div className="flex gap-2 md:col-span-2">
            <Input type="number" step="0.1" value={custom.lat} onChange={(e) => setCustom({ ...custom, lat: Number(e.target.value) })} aria-label="Latitude" />
            <Input type="number" step="0.1" value={custom.lon} onChange={(e) => setCustom({ ...custom, lon: Number(e.target.value) })} aria-label="Longitude" />
          </div>
        )}
        <Button variant="outline" onClick={() => { setF(DEFAULT_FILTERS); setZone("pointe-noire"); }}><RotateCcw className="h-4 w-4" />Réinitialiser les filtres</Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
        <strong>{results.length} résultat{results.length > 1 ? "s" : ""}</strong>
        <span className="text-muted-foreground">· périodes couvertes : {years} · zone : {zone === "custom" ? `${custom.lat}, ${custom.lon}` : ZONES[zone].label}</span>
        {active.map((k) => <span key={k} className="rounded bg-secondary px-2 py-0.5 text-xs font-bold">{k} : {String(f[k])}</span>)}
      </div>

      {results.length === 0 ? (
        <div className="panel mt-4 p-8 text-center text-muted-foreground">Aucun jeu de données ne correspond à ces critères. Élargissez la période ou réinitialisez les filtres.</div>
      ) : (
        <div className="panel mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase text-muted-foreground">
              <tr><th className="p-3">Jeu de données</th><th className="p-3">Période réelle</th><th className="p-3">Type</th><th className="p-3">Source</th><th className="p-3">Unités / résolution</th><th className="p-3" /></tr>
            </thead>
            <tbody>
              {results.map((d) => (
                <tr key={d.id} className="border-t border-border align-top">
                  <td className="p-3"><div className="font-bold">{d.name}</div><div className="text-xs text-muted-foreground">{d.category} · {d.area}</div></td>
                  <td className="p-3 whitespace-nowrap">{d.start} – {d.end}{d.start > 1950 && <div className="text-xs text-warning">Débute après 1950</div>}</td>
                  <td className="p-3">{TYPE_LABEL[d.type]}</td>
                  <td className="p-3">{d.source}<div className="text-xs text-muted-foreground">{d.access === "libre" ? "Accès libre" : "Compte requis"}</div></td>
                  <td className="p-3">{d.units}<div className="text-xs text-muted-foreground">{d.resolution} · {d.frequency}</div></td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setOpen(d)}><Eye className="h-4 w-4" />Consulter</Button>
                      {d.downloadUrl && <Button size="sm" variant="outline" asChild><a href={d.downloadUrl} target="_blank" rel="noreferrer"><Download className="h-4 w-4" />Télécharger</a></Button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          {open && <DatasetDetail d={open} lat={point.lat} lon={point.lon} start={f.start} end={f.end} bbox={zone === "custom" ? [custom.lat - 1, custom.lon - 1, custom.lat + 1, custom.lon + 1] : [...ZONES[zone].bbox]} />}
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}

function DatasetDetail({ d, lat, lon, start, end, bbox }: { d: Dataset; lat: number; lon: number; start: number; end: number; bbox: number[] }) {
  const s = Math.max(start, d.start);
  return (
    <>
      <DialogHeader><DialogTitle className="text-ocean-deep">{d.name}</DialogTitle></DialogHeader>
      <p className="text-sm">{d.description}</p>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        {[["Catégorie", d.category], ["Période", `${d.start} – ${d.end}`], ["Zone", d.area], ["Type", TYPE_LABEL[d.type]], ["Unités", d.units], ["Résolution", d.resolution], ["Fréquence", d.frequency], ["Profondeur", d.depth ?? "—"], ["Qualité", d.quality], ["Mise à jour", d.updated]].map(([k, v]) => (
          <div key={k}><dt className="text-xs font-bold text-muted-foreground">{k}</dt><dd>{v}</dd></div>
        ))}
      </dl>
      <div className="rounded-md bg-warning/15 p-3 text-sm"><strong>Limites d'interprétation : </strong>{d.limits}</div>
      {d.live === "ersst" || d.live === "waves" ? <LiveSeries kind={d.live} lat={lat} lon={lon} start={s} end={end} /> : null}
      {d.live === "argo" ? <ArgoList bbox={bbox} start={s} end={end} /> : null}
      {!d.live && <p className="text-sm text-muted-foreground">{d.access === "identifiants" ? "Ce produit nécessite un compte gratuit chez le fournisseur ; il n'est pas encore interrogé en direct par la plateforme." : "Les fichiers sont disponibles sur le portail officiel."}</p>}
      <div className="flex gap-2">
        <Button asChild variant="outline" size="sm"><a href={d.url} target="_blank" rel="noreferrer">Page officielle</a></Button>
        {d.downloadUrl && <Button asChild size="sm"><a href={d.downloadUrl} target="_blank" rel="noreferrer">Accès aux fichiers</a></Button>}
      </div>
    </>
  );
}

function LiveSeries({ kind, lat, lon, start, end }: { kind: "ersst" | "waves"; lat: number; lon: number; start: number; end: number }) {
  const q = useQuery({
    queryKey: [kind, lat, lon, start, end],
    queryFn: () => (kind === "ersst" ? getSstSeries : getWaveSeries)({ data: { lat, lon, start, end } }),
    staleTime: 3600_000,
  });
  if (q.isLoading) return <p className="text-sm text-muted-foreground">Chargement de la série depuis la source officielle…</p>;
  if (!q.data) return <p className="text-sm text-destructive">Impossible de charger la série.</p>;
  const csv = () => {
    const body = "annee,valeur_" + q.data.units + ",n_valeurs\n" + q.data.points.map((p) => `${p.year},${p.value ?? ""},${p.n}`).join("\n");
    const url = URL.createObjectURL(new Blob([body], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = `${kind}_${lat}_${lon}_${start}-${end}.csv`; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  };
  return (
    <div className="space-y-2">
      <h3 className="font-bold">Série historique ({lat}°, {lon}°)</h3>
      <SeriesChart data={q.data} />
      {!q.data.error && <Button size="sm" variant="outline" onClick={csv}><Download className="h-4 w-4" />Télécharger la série (CSV)</Button>}
    </div>
  );
}

function ArgoList({ bbox, start, end }: { bbox: number[]; start: number; end: number }) {
  const q = useQuery({
    queryKey: ["argo", bbox, start, end],
    queryFn: () => getArgoProfiles({ data: { bbox: bbox as [number, number, number, number], start, end } }),
    staleTime: 3600_000,
  });
  if (q.isLoading) return <p className="text-sm text-muted-foreground">Interrogation du serveur Argo (Ifremer)…</p>;
  if (q.data?.error) return <p className="text-sm text-destructive">{q.data.error}</p>;
  const p = q.data?.profiles ?? [];
  if (!p.length) return <p className="text-sm text-muted-foreground">Aucun profil Argo dans cette zone et cette période.</p>;
  return (
    <div>
      <h3 className="font-bold">{q.data!.total} profils Argo trouvés (200 plus récents affichés)</h3>
      <div className="mt-2 max-h-56 overflow-y-auto rounded border border-border text-xs">
        <table className="w-full"><thead className="bg-muted"><tr><th className="p-1 text-left">Flotteur</th><th className="p-1 text-left">Date</th><th className="p-1 text-left">Lat</th><th className="p-1 text-left">Lon</th></tr></thead>
          <tbody>{p.map((r, i) => <tr key={i} className="border-t border-border"><td className="p-1"><a className="text-primary underline" href={`https://fleetmonitoring.euro-argo.eu/float/${r.platform}`} target="_blank" rel="noreferrer">{r.platform}</a></td><td className="p-1">{r.time.slice(0, 10)}</td><td className="p-1">{r.lat.toFixed(2)}</td><td className="p-1">{r.lon.toFixed(2)}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
