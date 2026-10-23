import { createFileRoute, redirect } from "@tanstack/react-router";

// Ancienne adresse : tout est désormais regroupé sur la page d'accueil.
export const Route = createFileRoute("/sources")({
  beforeLoad: () => {
    throw redirect({ to: "/", search: { tab: "sources" }, statusCode: 301 });
  },
});
