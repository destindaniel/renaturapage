import { useState } from "react";
import { ChevronDown, Lightbulb, Search, LineChart, FileDown } from "lucide-react";

const STEPS = [
  { icon: Search, t: "1. Choisir une donnée", d: "Dans « Données & séries », tapez un mot (température, salinité, vagues) puis cliquez sur « Consulter »." },
  { icon: LineChart, t: "2. Lire la courbe", d: "La courbe montre l'évolution année par année au large de Pointe-Noire. Le « Comparateur » compare les périodes depuis 1950." },
  { icon: FileDown, t: "3. Télécharger", d: "Exportez la série en PDF ou CSV. Dans « Bibliothèque », ouvrez les articles scientifiques en libre accès." },
];

const WORDS = [
  { w: "Anomalie", d: "Écart par rapport à la normale 1991-2020 (ex. +0,8 °C = plus chaud que d'habitude)." },
  { w: "Salinité (PSU)", d: "Quantité de sel dans l'eau ; plus faible près de l'embouchure du fleuve Congo." },
  { w: "Flotteur Argo", d: "Robot dérivant qui mesure température et salinité en profondeur." },
];

export function QuickGuide() {
  const [open, setOpen] = useState(true);
  return (
    <section id="guide" className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-10">
      <div className="panel overflow-hidden">
        <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-3 p-5 text-left">
          <span className="flex items-center gap-2 text-xl font-extrabold text-ocean-deep">
            <Lightbulb className="h-6 w-6 text-primary" />Guide rapide — comment utiliser la plateforme
          </span>
          <ChevronDown className={`h-5 w-5 transition ${open ? "rotate-180" : ""}`} />
        </button>
        {open && (
          <div className="space-y-5 px-5 pb-5">
            <div className="grid gap-4 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.t} className="rounded-lg bg-secondary p-4">
                  <s.icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-2 font-bold">{s.t}</h3>
                  <p className="text-sm text-muted-foreground">{s.d}</p>
                </div>
              ))}
            </div>
            <div>
              <h3 className="font-bold">Petit lexique</h3>
              <ul className="mt-2 grid gap-2 text-sm md:grid-cols-3">
                {WORDS.map((x) => (
                  <li key={x.w}><span className="font-bold text-primary">{x.w} :</span> <span className="text-muted-foreground">{x.d}</span></li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
