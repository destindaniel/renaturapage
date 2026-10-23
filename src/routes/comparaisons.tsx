import { createFileRoute, redirect } from "@tanstack/react-router";

// Ancienne adresse : tout est désormais regroupé sur la page d'accueil.
export const Route = createFileRoute("/comparaisons")({
  beforeLoad: () => {
    throw redirect({ to: "/", search: { tab: "comparaisons" }, statusCode: 301 });
  },
});
