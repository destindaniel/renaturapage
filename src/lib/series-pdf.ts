import type { SeriesResult } from "./ocean.functions";

// Builds a PDF report of a real data series (metadata + chart + yearly table) in the browser.
export async function seriesToPdf(title: string, s: SeriesResult, lat: number, lon: number, filename: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const clean = (t: string) => t.replace(/√/g, "racine").replace(/≈/g, "~").replace(/[—–]/g, "-");
  const rawText = doc.text.bind(doc);
  doc.text = ((t: string | string[], ...rest: unknown[]) => (rawText as (...a: unknown[]) => unknown)(Array.isArray(t) ? t.map(clean) : clean(t), ...rest)) as typeof doc.text;
  const W = 210, M = 15;
  let y = 18;
  doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(20, 110, 115);
  doc.text("Renatura Congo", M, y); y += 7;
  doc.setTextColor(30, 30, 30); doc.setFontSize(12);
  doc.text(doc.splitTextToSize(title, W - 2 * M), M, y); y += 8;
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  const meta = [
    `Point : ${lat}°, ${lon}°`,
    `Source : ${s.source}`,
    `Méthode : ${s.method}`,
    `Unités : ${s.units}`,
    `Années sans valeur : ${s.missingYears.length ? s.missingYears.join(", ") : "aucune"}`,
    `Généré le ${new Date().toLocaleString("fr-FR")}`,
  ];
  for (const l of meta) { const lines = doc.splitTextToSize(l, W - 2 * M); doc.text(lines, M, y); y += lines.length * 4.5; }
  y += 3;

  // Line chart
  const pts = s.points.filter((p) => p.value !== null) as { year: number; value: number }[];
  if (pts.length > 1) {
    const cw = W - 2 * M, ch = 60, x0 = M, y0 = y;
    const minV = Math.min(...pts.map((p) => p.value)), maxV = Math.max(...pts.map((p) => p.value));
    const span = maxV - minV || 1;
    const minY = s.points[0]!.year, maxY = s.points[s.points.length - 1]!.year;
    const px = (yr: number) => x0 + ((yr - minY) / (maxY - minY || 1)) * cw;
    const py = (v: number) => y0 + ch - ((v - minV) / span) * ch;
    doc.setDrawColor(200); doc.rect(x0, y0, cw, ch);
    doc.setDrawColor(20, 140, 145); doc.setLineWidth(0.5);
    for (let i = 1; i < pts.length; i++) doc.line(px(pts[i - 1]!.year), py(pts[i - 1]!.value), px(pts[i]!.year), py(pts[i]!.value));
    doc.setLineWidth(0.2); doc.setFontSize(8); doc.setTextColor(90);
    doc.text(`${maxV.toFixed(2)} ${s.units}`, x0 + 1, y0 + 4);
    doc.text(`${minV.toFixed(2)} ${s.units}`, x0 + 1, y0 + ch - 1);
    doc.text(String(minY), x0, y0 + ch + 4);
    doc.text(String(maxY), x0 + cw, y0 + ch + 4, { align: "right" });
    y = y0 + ch + 10;
  }

  // Table
  doc.setTextColor(30); doc.setFontSize(9); doc.setFont("helvetica", "bold");
  const head = () => { doc.text("Année", M, y); doc.text(`Valeur (${s.units})`, M + 30, y); doc.text("Nb valeurs", M + 70, y); y += 5; doc.setFont("helvetica", "normal"); };
  head();
  for (const p of s.points) {
    if (y > 285) { doc.addPage(); y = 18; doc.setFont("helvetica", "bold"); head(); }
    doc.text(String(p.year), M, y); doc.text(p.value === null ? "—" : String(p.value), M + 30, y); doc.text(String(p.n), M + 70, y);
    y += 4.5;
  }
  doc.save(filename);
}
