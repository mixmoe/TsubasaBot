import { interpolate, segment, template } from "@koishijs/utils";
import * as fs from "fs";
import * as _ from "lodash";
import * as mustache from "mustache";
import * as path from "path";

export type TemplateParam = { $mustache?: boolean; [key: string]: any };

export class SegmentURL extends URL {
  public static from(url: unknown) {
    if (url instanceof URL) {
      return new SegmentURL(url);
    } else if (typeof url === "string" && url.match(/^https?:/)) {
      try {
        return new SegmentURL(url);
      } catch {
        return;
      }
    }
  }

  get image() {
    return segment.image(this.href);
  }

  get audio() {
    return segment.audio(this.href);
  }

  get video() {
    return segment.video(this.href);
  }

  get file() {
    return segment.file(this.href);
  }
}

export function format(source: string): string;
export function format(source: string, params: TemplateParam): string;
export function format(source: string, ...params): string {
  const [context] = params;

  if (context && typeof context === "object") {
    const { $mustache, ...param } = _.cloneDeepWith<TemplateParam>(
      context,
      SegmentURL.from,
    );
    source = $mustache
      ? mustache
          .render(source, param, undefined, { escape: segment.escape })
          .split(`\n`)
          .filter((l) => l.trim().length > 0)
          .join(`\n`)
      : interpolate(source, param);
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
}

export function from(filepath: string, newExt?: string): string {
  const { root, dir, name, ext } = path.parse(filepath);
  return fs.readFileSync(
    path.format({ root, dir, name, ext: newExt ?? ext }),
    "utf8",
  );
}

Object.defineProperty(template, "format", { get: () => format });
Object.defineProperty(template, "from", { get: () => from });

declare module "@koishijs/utils" {
  function template(path: string | string[]): string;
  function template(path: string | string[], params: TemplateParam): string;
  function template(path: string | string[], ...params): string;

  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace template {
    function from(filepath: string, newExt?: `.${string}`): string;
  }
}
