import { createFileRoute, redirect } from "@tanstack/react-router";

// Ancienne adresse : tout est désormais regroupé sur la page d'accueil.
export const Route = createFileRoute("/bibliotheque")({
  beforeLoad: () => {
    throw redirect({ to: "/", search: { tab: "bibliotheque" }, statusCode: 301 });
  },
});
