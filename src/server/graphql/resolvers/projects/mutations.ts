import { Context } from "../../context.ts";
import { Project } from "../../objects/project.ts";

export async function createProject(
  root: any,
  args: any,
  ctx: Context
): Promise<Project> {
  return new Project({
    id: "2",
    name: "trusting_pasteur",
    template: "nix",
    status: "Stopped",
    containerId: "",
    createdAt: "2024-02-11T19:00:00.778Z",
    updatedAt: "2024-02-11T19:00:00.778Z",
  });
}
