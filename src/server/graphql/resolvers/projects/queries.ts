import { Context } from "../../context.ts";
import { Project } from "../../objects/project.ts";

export async function getProjects(
  root: any,
  args: any,
  ctx: Context
): Promise<Project[]> {
  return [];
}

export async function getProjectDetails(
  root: any,
  args: any,
  ctx: Context
): Promise<Project | null> {
  return null;
}
