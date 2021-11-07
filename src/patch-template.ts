import { interpolate, template } from "@koishijs/utils";
import * as mustache from "mustache";

export type TemplateParam = { useMustache?: boolean } & Record<string, any>;

template.format = (source: string, ...params: any[]): string => {
  const [context] = params;
  if (context && typeof context === "object") {
    if ((context as TemplateParam).useMustache)
      source = mustache.render(source, context);
    else source = interpolate(source, context);
  }
  let result = "",
    cap: RegExpExecArray | null;
  while ((cap = /\{(\w+)\}/.exec(source))) {
    const [matched, captured] = cap;
    result +=
      source.slice(0, cap.index) + (captured in params ? params[captured] : "");
    source = source.slice(cap.index + matched.length);
  }
  return result + source;
};

declare module "koishi" {
  function template(path: string | string[]): string;
  function template(path: string | string[], params: TemplateParam): string;
  function template(path: string | string[], ...params): string;
}
