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

builder.objectType(Project, {
  name: "Project",
  description: "A project is an instance of a template.",
  fields: (t) => ({
    id: t.exposeID("id"),
    name: t.exposeString("name"),
    template: t.exposeString("template"),
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

export const schema = builder.toSchema();
