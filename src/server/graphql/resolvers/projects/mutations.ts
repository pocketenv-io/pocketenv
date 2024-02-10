import { Context } from "../../context.ts";
import { Project } from "../../objects/project.ts";

export async function createProject(
  root: any,
  args: any,
  ctx: Context
): Promise<Project> {
  return new Project(
    "id",
    "demo",
    "template",
    new Date().toISOString(),
    new Date().toISOString()
  );
}
