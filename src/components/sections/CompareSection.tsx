import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageShell } from "@/components/SiteLayout";
import { SeriesChart } from "@/components/SeriesChart";
import { Input } from "@/components/ui/input";
import { CURRENT_YEAR, ZONES } from "@/lib/catalog";
import { getSstSeries, type SeriesResult } from "@/lib/ocean.functions";
import { getWaves as getWaveSeries } from "@/lib/browser-sources";
import { comparePeriods, DEFAULT_PERIODS, type Period } from "@/lib/periods";


export function Compare() {
  const [variable, setVariable] = useState<"ersst" | "waves">("ersst");
  const [zone, setZone] = useState<keyof typeof ZONES>("pointe-noire");
  const [periods, setPeriods] = useState<Period[]>(DEFAULT_PERIODS);
  const z = ZONES[zone];
  const q = useQuery<SeriesResult>({
    queryKey: ["cmp", variable, zone],
    queryFn: () => (variable === "ersst" ? getSstSeries : getWaveSeries)({ data: { lat: z.lat, lon: z.lon, start: 1950, end: CURRENT_YEAR } }),
    staleTime: 3600_000,
  });
  const { rows, baseline } = q.data ? comparePeriods(q.data.points, periods) : { rows: [], baseline: null };

  return (
    <PageShell title="Comparaisons historiques" subtitle="Moyennes par période calculées à partir des séries réelles. Référence climatique : moyenne 1991–2020 (norme OMM).">
      <div className="panel flex flex-wrap gap-3 p-4">
        <select className="h-9 rounded-md border border-input bg-card px-2 text-sm" value={variable} onChange={(e) => setVariable(e.target.value as "ersst" | "waves")}>
          <option value="ersst">Température de surface (NOAA ERSST v5)</option>
          <option value="waves">Hauteur des vagues (ERA5)</option>
        </select>
        <select className="h-9 rounded-md border border-input bg-card px-2 text-sm" value={zone} onChange={(e) => setZone(e.target.value as keyof typeof ZONES)}>
          {Object.entries(ZONES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
      </div>

      <div className="panel mt-4 p-4">
        <h2 className="mb-2 text-lg font-bold">Évolution annuelle 1950 – {CURRENT_YEAR}</h2>
        {q.isLoading ? <p className="text-sm text-muted-foreground">Chargement depuis la source officielle…</p> : q.data && <SeriesChart data={q.data} baseline={baseline} />}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="panel p-4">
          <h2 className="mb-2 text-lg font-bold">Périodes (personnalisables)</h2>
          {periods.map((p, i) => (
            <div key={i} className="mb-2 flex items-center gap-2">
              <Input type="number" value={p.from} onChange={(e) => setPeriods(periods.map((x, j) => (j === i ? { ...x, from: Number(e.target.value) } : x)))} />
              <span>→</span>
              <Input type="number" value={p.to} onChange={(e) => setPeriods(periods.map((x, j) => (j === i ? { ...x, to: Number(e.target.value) } : x)))} />
            </div>
          ))}
          <table className="mt-3 w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground"><tr><th>Période</th><th>Moyenne</th><th>Anomalie</th><th>Années</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-t border-border">
                  <td className="py-1">{r.label}</td>
                  <td>{r.mean != null ? `${r.mean.toFixed(2)} ${q.data?.units}` : "—"}</td>
                  <td className={r.anomaly != null && r.anomaly > 0 ? "text-destructive" : "text-primary"}>{r.anomaly != null ? `${r.anomaly > 0 ? "+" : ""}${r.anomaly.toFixed(2)}` : "—"}</td>
                  <td className="text-xs">{r.years}/{r.expected}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel p-4">
          <h2 className="mb-2 text-lg font-bold">Anomalie par période</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={rows.filter((r) => r.anomaly != null)}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
                <XAxis dataKey="label" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip />
                <Bar dataKey="anomaly" fill="var(--chart-1)" name="Anomalie vs 1991–2020" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Une seule source par graphique : les produits différents ne sont pas mélangés sans harmonisation. « Années » = années disposant de valeurs / années de la période.</p>
        </div>
      </div>
    </PageShell>
  );
}
