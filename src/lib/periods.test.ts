import { describe, expect, it } from "vitest";
import { comparePeriods } from "./periods";
import { DATASETS, DEFAULT_FILTERS, filterDatasets } from "./catalog";

describe("comparePeriods", () => {
  const pts = Array.from({ length: 71 }, (_, i) => ({ year: 1950 + i, value: 1950 + i < 1991 ? 26 : 27 }));
  it("computes anomaly against the 1991–2020 baseline", () => {
    const { rows, baseline } = comparePeriods(pts, [{ from: 1950, to: 1979 }]);
    expect(baseline).toBe(27);
    expect(rows[0]?.anomaly).toBe(-1);
  });
  it("never fills missing years", () => {
    const { rows } = comparePeriods(pts, [{ from: 2021, to: 2025 }]);
    expect(rows[0]?.mean).toBeNull();
    expect(rows[0]?.years).toBe(0);
  });
});

describe("filterDatasets", () => {
  it("excludes products that start after the selected end year", () => {
    const r = filterDatasets(DATASETS, { ...DEFAULT_FILTERS, start: 1950, end: 1980 });
    expect(r.every((d) => d.start <= 1980)).toBe(true);
    expect(r.find((d) => d.id === "argo-gdac")).toBeUndefined();
  });
  it("combines category and access filters", () => {
    const r = filterDatasets(DATASETS, { ...DEFAULT_FILTERS, category: "Hauteur des vagues", access: "libre" });
    expect(r.map((d) => d.id)).toEqual(["era5-ocean-waves"]);
  });
});
