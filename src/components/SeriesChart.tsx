import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { SeriesResult } from "@/lib/ocean.functions";

export function SeriesChart({ data, baseline }: { data: SeriesResult; baseline?: number | null }) {
  const pts = data.points.filter((p) => p.value !== null);
  if (data.error) return <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{data.error}. Réessayez plus tard.</p>;
  if (!pts.length) return <p className="text-sm text-muted-foreground">Aucune valeur disponible pour cette période.</p>;
  return (
    <div>
      <div className="h-64 w-full">
        <ResponsiveContainer>
          <AreaChart data={data.points} margin={{ left: 0, right: 8, top: 8 }}>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="year" fontSize={12} />
            <YAxis fontSize={12} domain={["auto", "auto"]} unit={` ${data.units}`} width={70} />
            <Tooltip formatter={(v) => [`${v} ${data.units}`, "Moyenne annuelle"]} />
            {baseline != null && <ReferenceLine y={baseline} stroke="var(--chart-3)" strokeDasharray="4 4" label={{ value: "Référence", fontSize: 11 }} />}
            <Area type="monotone" dataKey="value" stroke="var(--chart-1)" fill="url(#g)" strokeWidth={2} connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <dl className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
        <div><dt className="inline font-bold">Source : </dt><dd className="inline">{data.source}</dd></div>
        <div><dt className="inline font-bold">Méthode : </dt><dd className="inline">{data.method}</dd></div>
        <div><dt className="inline font-bold">Période : </dt><dd className="inline">{pts[0]?.year} – {pts[pts.length - 1]?.year} ({data.units})</dd></div>
        <div><dt className="inline font-bold">Années manquantes : </dt><dd className="inline">{data.missingYears.length ? data.missingYears.slice(0, 12).join(", ") + (data.missingYears.length > 12 ? "…" : "") : "aucune"}</dd></div>
      </dl>
    </div>
  );
}
