import { createFileRoute, redirect } from "@tanstack/react-router";

// Ancienne adresse : tout est désormais regroupé sur la page d'accueil.
export const Route = createFileRoute("/archives")({
  beforeLoad: () => {
    throw redirect({ to: "/", search: { tab: "archives" }, statusCode: 301 });
  },
});
