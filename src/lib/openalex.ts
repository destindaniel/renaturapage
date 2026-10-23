// Browser-safe OpenAlex helpers shared by the server function and the visitor's browser.
export interface Work {
  id: string; title: string; year: number | null; authors: string[]; doi: string | null; language: string | null;
  type: string | null; source: string | null; abstract: string | null; landing: string | null; pdf: string | null;
  isOa: boolean; license: string | null; concepts: string[];
}
export interface LitQuery { q: string; theme: string; fromYear: number; toYear: number; oaOnly: boolean; type: string; page: number }
export interface LitResult { works: Work[]; count: number; error?: string }

function rebuildAbstract(inv?: Record<string, number[]> | null): string | null {
  if (!inv) return null;
  const words: string[] = [];
  for (const [w, pos] of Object.entries(inv)) for (const p of pos) words[p] = w;
  return words.join(" ");
}

export function buildLiteratureUrl(d: LitQuery, apiKey?: string): string {
  const terms = [d.q || "ocean", d.theme, "Congo OR \"Gulf of Guinea\" OR \"Pointe-Noire\""].filter(Boolean).join(" ");
  const filters = [`publication_year:${d.fromYear}-${d.toYear}`];
  if (d.oaOnly) filters.push("is_oa:true");
  if (d.type) filters.push(`type:${d.type}`);
  let url = `https://api.openalex.org/works?search=${encodeURIComponent(terms)}&filter=${filters.join(",")}&per-page=20&page=${d.page}&sort=relevance_score:desc&mailto=contact@renatura.cg`;
  if (apiKey) url += `&api_key=${encodeURIComponent(apiKey)}`;
  return url;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseWorks(j: any): LitResult {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const works: Work[] = (j.results ?? []).map((w: any) => ({
    id: w.id,
    title: w.title ?? w.display_name ?? "(sans titre)",
    year: w.publication_year ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    authors: (w.authorships ?? []).slice(0, 6).map((a: any) => a.author?.display_name).filter(Boolean),
    doi: w.doi ?? null,
    language: w.language ?? null,
    type: w.type ?? null,
    source: w.primary_location?.source?.display_name ?? null,
    abstract: rebuildAbstract(w.abstract_inverted_index),
    landing: w.primary_location?.landing_page_url ?? w.doi ?? null,
    pdf: w.best_oa_location?.pdf_url ?? null,
    isOa: Boolean(w.open_access?.is_oa),
    license: w.best_oa_location?.license ?? null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    concepts: (w.topics ?? []).slice(0, 3).map((c: any) => c.display_name),
  }));
  return { works, count: j.meta?.count ?? 0 };
}

/** Query OpenAlex straight from the visitor's browser (their own quota, not the shared server IP). */
export async function searchLiteratureInBrowser(d: LitQuery): Promise<LitResult> {
  const res = await fetch(buildLiteratureUrl(d));
  if (!res.ok) return { works: [], count: 0, error: `OpenAlex a répondu ${res.status}` };
  return parseWorks(await res.json());
}
