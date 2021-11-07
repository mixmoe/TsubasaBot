import { interpolate, template } from "@koishijs/utils";
import * as mustache from "mustache";

export type TemplateParam = { $mustache?: boolean; [key: string]: any };

export function format(source: string): string;
export function format(source: string, params: TemplateParam): string;
export function format(source: string, ...params): string {
  const [context] = params;

  if (context && typeof context === "object")
    source = (context as TemplateParam).$mustache
      ? mustache.render(source, context)
      : interpolate(source, context);

  let result = "",
    cap: RegExpExecArray | null;

  while ((cap = /\{(\w+)\}/.exec(source))) {
    const [matched, captured] = cap;
    result +=
      source.slice(0, cap.index) + (captured in params ? params[captured] : "");
    source = source.slice(cap.index + matched.length);
  }
  return result + source;
}

Object.defineProperty(template, "format", { get: () => format });

declare module "koishi" {
  function template(path: string | string[]): string;
  function template(path: string | string[], params: TemplateParam): string;
  function template(path: string | string[], ...params): string;
}
