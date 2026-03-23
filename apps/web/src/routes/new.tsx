import { createFileRoute } from "@tanstack/react-router";
import NewPage from "../pages/new";
import z from "zod";

const newProjectSchema = z.object({
  repo: z.string().optional(),
  base: z.string().default("docker"),
});

export const Route = createFileRoute("/new")({
  validateSearch: (search) => newProjectSchema.parse(search),
  component: NewPage,
});
