import { Context } from "../../context.ts";
import { Project } from "../../objects/project.ts";

export async function getProjects(
  root: any,
  args: any,
  ctx: Context
): Promise<Project[]> {
  const projects = [
    {
      id: "1",
      name: "confident_dubinsky",
      template: "pkgx",
      status: "Running",
      containerId: "cf9d06c80fec",
      createdAt: "2024-02-11T19:00:00.778Z",
      updatedAt: "2024-02-11T19:00:00.778Z",
    },
    {
      id: "2",
      name: "trusting_pasteur",
      template: "nix",
      status: "Stopped",
      containerId: "",
      createdAt: "2024-02-11T19:00:00.778Z",
      updatedAt: "2024-02-11T19:00:00.778Z",
    },
  ];
  return projects;
}

export async function getProjectDetails(
  root: any,
  args: any,
  ctx: Context
): Promise<Project | null> {
  const project = {
    id: "1",
    name: "confident_dubinsky",
    template: "pkgx",
    status: "Running",
    containerId: "cf9d06c80fec",
    createdAt: "2024-02-11T19:00:00.778Z",
    updatedAt: "2024-02-11T19:00:00.778Z",
  };
  return project;
}
