export interface Period { from: number; to: number }
export interface PeriodRow { label: string; mean: number | null; anomaly: number | null; years: number; expected: number }

const NOW = new Date().getFullYear();
export const DEFAULT_PERIODS: Period[] = [
  { from: 1950, to: 1979 }, { from: 1980, to: 1999 }, { from: 2000, to: 2010 }, { from: 2011, to: 2020 }, { from: 2021, to: NOW },
];
export const BASELINE: Period = { from: 1991, to: 2020 };

function mean(points: { year: number; value: number | null }[], p: Period) {
  const v = points.filter((x) => x.year >= p.from && x.year <= p.to && x.value != null).map((x) => x.value as number);
  return { mean: v.length ? v.reduce((a, b) => a + b, 0) / v.length : null, years: v.length };
}

export function comparePeriods(points: { year: number; value: number | null }[], periods: Period[]) {
  const b = mean(points, BASELINE);
  // require at least 2/3 of the baseline years to publish an anomaly
  const baseline = b.years >= 20 ? b.mean : null;
  const rows: PeriodRow[] = periods.map((p) => {
    const m = mean(points, p);
    return {
      label: `${p.from}–${p.to}`,
      mean: m.mean,
      anomaly: m.mean != null && baseline != null ? m.mean - baseline : null,
      years: m.years,
      expected: Math.max(0, p.to - p.from + 1),
    };
  });
  return { rows, baseline };
}
