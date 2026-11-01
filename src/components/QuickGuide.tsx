import { useState } from "react";
import { ChevronDown, Lightbulb, Search, LineChart, FileDown } from "lucide-react";
import step1 from "@/assets/guide-step1.jpg";
import step2 from "@/assets/guide-step2.jpg";
import step3 from "@/assets/guide-step3.jpg";

const STEPS = [
  {
    icon: Search,
    image: step1,
    alt: "Illustration d'une personne qui cherche des données océaniques sur un ordinateur",
    t: "1. Trouver une donnée",
    how: [
      "Cliquez sur l'onglet « Données & séries » plus bas.",
      "Tapez un mot dans la recherche : température, salinité, vagues…",
      "Cliquez sur « Consulter » à droite de la ligne choisie.",
    ],
  },
  {
    icon: LineChart,
    image: step2,
    alt: "Illustration d'une courbe qui monte au-dessus de l'océan à Pointe-Noire",
    t: "2. Lire et comparer",
    how: [
      "La courbe montre la valeur de chaque année au large de Pointe-Noire.",
      "Une courbe qui monte = l'océan se réchauffe ou change.",
      "Dans « Comparateur », voyez la différence entre 1950 et aujourd'hui.",
    ],
  },
  {
    icon: FileDown,
    image: step3,
    alt: "Illustration d'un rapport PDF téléchargé depuis un ordinateur",
    t: "3. Télécharger et lire",
    how: [
      "Dans la fenêtre d'une série, cliquez sur « PDF » ou « CSV ».",
      "Le rapport contient la courbe, les valeurs et la source.",
      "Dans « Bibliothèque », ouvrez les articles scientifiques gratuits.",
    ],
  },
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
          <div className="space-y-6 px-5 pb-5">
            <div className="grid gap-4 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.t} className="overflow-hidden rounded-lg border border-border bg-secondary">
                  <img src={s.image} alt={s.alt} loading="lazy" width={1024} height={640} className="aspect-[16/10] w-full object-cover" />
                  <div className="p-4">
                    <h3 className="flex items-center gap-2 font-bold"><s.icon className="h-5 w-5 text-primary" />{s.t}</h3>
                    <ol className="mt-2 space-y-1.5 text-sm text-muted-foreground">
                      {s.how.map((h, i) => (
                        <li key={h} className="flex gap-2">
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
                          <span>{h}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
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
