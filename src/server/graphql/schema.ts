import { builder } from "./builder.ts";
import { Project } from "./objects/project.ts";
import { Template } from "./objects/template.ts";
import {
  getProjectDetails,
  getProjects,
} from "./resolvers/projects/queries.ts";
import {
  getTemplates,
  getTemplateDetails,
} from "./resolvers/templates/queries.ts";
import { createProject } from "./resolvers/projects/mutations.ts";

builder.objectType(Project, {
  name: "Project",
  description: "A project is an instance of a template.",
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    template: t.exposeString("template"),
    containerId: t.exposeString("containerId"),
    status: t.exposeString("status"),
    createdAt: t.exposeString("createdAt"),
    updatedAt: t.exposeString("updatedAt"),
  }),
});

builder.objectType(Template, {
  name: "Template",
  description: "A template is a project blueprint.",
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    description: t.exposeString("description"),
    logo: t.exposeString("logo"),
    readme: t.exposeString("readme"),
    repoUrl: t.exposeString("repoUrl"),
    packageName: t.exposeString("packageName"),
  }),
});

builder.queryType({
  fields: (t) => ({
    projects: t.field({
      type: [Project],
      resolve: getProjects,
    }),
    templates: t.field({
      type: [Template],
      resolve: getTemplates,
    }),
    project: t.field({
      type: Project,
      nullable: true,
      args: {
        id: t.arg.id(),
      },
      resolve: getProjectDetails,
    }),
    template: t.field({
      type: Template,
      nullable: true,
      args: {
        id: t.arg.id(),
      },
      resolve: getTemplateDetails,
    }),
  }),
});

builder.mutationType({
  fields: (t) => ({
    createProject: t.field({
      type: Project,
      args: {
        name: t.arg.string(),
        template: t.arg.string(),
      },
      resolve: createProject,
    }),
  }),
});

export const schema = builder.toSchema();
