import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/aluno")({
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
