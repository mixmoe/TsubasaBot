import { segment } from "koishi";

export function EnumerateType<T>(enumerate: T): (source: string) => keyof T {
  const keys = Object.keys(enumerate).filter(
      (v) => typeof v === "string" && typeof enumerate[v] === "number"
    ) as (keyof T)[],
    values = Object.values(enumerate).filter(
      (v) => typeof v === "number" && typeof enumerate[v] === "string"
    ) as T[];
  const valueMap = Object.fromEntries(values.map((v, i) => [v, keys[i]]));

  if (keys.length !== values.length || keys.length <= 0)
    throw new Error("EnumerateType: invalid enumerate");

  return (source: string): keyof T => {
    const choice = values.find((value) => +value === +source);
    if (!choice)
      throw new Error(
        `无效的枚举值, 可用项为:\n` +
          values.map((value) => `${value}->${valueMap[value]}`).join(`\n`)
      );
    return valueMap[choice];
  };
}

export function BoundedNumber(options: {
  le?: number;
  lt?: number;
  ge?: number;
  gt?: number;
}): (source: string) => number {
  return (source: string): number => {
    const { le, lt, ge, gt } = options;
    const value = +source;
    if (le != undefined && value >= le) throw new Error(`必须小于或等于${le}`);
    if (lt != undefined && value > lt) throw new Error(`必须小于${lt}`);
    if (ge != undefined && value <= ge) throw new Error(`必须大于或等于${ge}`);
    if (gt != undefined && value < gt) throw new Error(`必须大于${gt}`);
    return value;
  };
}

export const randomChoice = <T>(array: T[]): T | undefined => {
  return array.length > 0
    ? array[Math.floor(Math.random() * array.length)]
    : undefined;
};

export const imageSegment = (options: { file: string; cache?: boolean }) =>
  segment("image", options);

export const cardImageSegment = (options: {
  file: string;
  source?: string;
  icon?: string;
}) => segment("cardimage", options);
