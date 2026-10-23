import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Clock, Waves } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { tab: "archives", label: "Données & séries" },
  { tab: "comparaisons", label: "Comparateur" },
  { tab: "bibliotheque", label: "Bibliothèque" },
  { tab: "sources", label: "Sources & flux" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground">
            <Waves className="h-6 w-6" />
          </span>
          <span className="font-display text-2xl font-extrabold text-ocean-deep">Renatura</span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex">
          {NAV.map((n) => (
            <Link
              key={n.tab}
              to="/"
              search={{ tab: n.tab }}
              hash="tableau"
              activeOptions={{ includeSearch: true }}
              className="border-b-2 border-transparent py-1 text-sm font-bold text-foreground hover:text-primary"
              activeProps={{ className: "border-primary text-primary" }}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
      <nav className="flex gap-4 overflow-x-auto px-4 pb-2 lg:hidden">
        {NAV.map((n) => (
          <Link key={n.tab} to="/" search={{ tab: n.tab }} hash="tableau" className="whitespace-nowrap text-sm font-semibold" activeProps={{ className: "text-primary" }} activeOptions={{ includeSearch: true }}>
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-ocean-deep text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-bold">Renatur Océan</h3>
          <p className="mt-1 text-sm opacity-80">Plateforme de recherche, de surveillance et d'archivage océanographique — Pointe-Noire et golfe de Guinée.</p>
        </div>
        <div className="flex flex-wrap gap-5 text-sm opacity-90 md:justify-end">
          <span className="flex items-center gap-2"><Mail className="h-4 w-4" />contact@renatura.cg</span>
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4" />Pointe-Noire, République du Congo</span>
          <span className="flex items-center gap-2"><Clock className="h-4 w-4" />Lun – Ven, 8h – 17h</span>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 py-3 text-center text-xs opacity-70">© {new Date().getFullYear()} Renatura — Données citées selon les licences de leurs producteurs.</div>
    </footer>
  );
}

export function PageShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-3xl font-extrabold text-ocean-deep md:text-4xl">{title}</h1>
      {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}
