import { Context } from "../../context.ts";
import { Template } from "../../objects/template.ts";

export async function getTemplates(
  root: any,
  args: any,
  ctx: Context
): Promise<Template[]> {
  return [];
}

export async function getTemplateDetails(
  root: any,
  args: any,
  ctx: Context
): Promise<Template | null> {
  return null;
}
