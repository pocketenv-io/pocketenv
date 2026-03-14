import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import ProjectsPage from "../pages/projects";

const projectsSearchSchema = z.object({
  did: z.string().optional(),
  cli: z.number().optional(),
});

export const Route = createFileRoute("/projects")({
  validateSearch: projectsSearchSchema,
  beforeLoad: ({ search }) => {
    const isOAuthCallback = !!search.did;
    const isAuthenticated = !!localStorage.getItem("token");

    if (!isAuthenticated && !isOAuthCallback) {
      throw redirect({ to: "/" });
    }
  },
  component: ProjectsPage,
});
