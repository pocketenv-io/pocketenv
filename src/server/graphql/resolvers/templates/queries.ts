import { Context } from "../../context.ts";
import { Template } from "../../objects/template.ts";
import { templates } from "./mocks.ts";

export async function getTemplates(
  root: any,
  args: any,
  ctx: Context
): Promise<Template[]> {
  return templates;
}

export async function getTemplateDetails(
  root: any,
  args: any,
  ctx: Context
): Promise<Template | null> {
  const template = templates.find((template) => template.id === args.id);
  return template!;
}
