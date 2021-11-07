import { AsyncLocalStorage } from "async_hooks";
import * as dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import * as dayjsDuration from "dayjs/plugin/duration";
import * as dayjsLocalizedFormat from "dayjs/plugin/localizedFormat";
import * as dayjsRelativeTime from "dayjs/plugin/relativeTime";
import { Session } from "koishi";

dayjs.extend(dayjsDuration);
dayjs.extend(dayjsRelativeTime);
dayjs.extend(dayjsLocalizedFormat);
dayjs.locale("zh-cn");

export { dayjs as datetime };

export const storage = new AsyncLocalStorage<EventLocal>();
export class EventLocal extends Map<string, any> {
  readonly SESSION_KEY = "session" as const;

  constructor(session: Session) {
    super();
    this.set(this.SESSION_KEY, session);
  }

  get session(): Session {
    return this.get(this.SESSION_KEY) as Session;
  }
}

export function EnumerateType<T>(enumerate: T): (source: string) => keyof T {
  const keys = Object.keys(enumerate).filter(
      (v) => typeof v === "string" && typeof enumerate[v] === "number",
    ) as (keyof T)[],
    values = Object.values(enumerate).filter(
      (v) => typeof v === "number" && typeof enumerate[v] === "string",
    ) as T[];
  const valueMap = Object.fromEntries(values.map((v, i) => [v, keys[i]]));

  if (keys.length !== values.length || keys.length <= 0)
    throw new Error("EnumerateType: invalid enumerate");

  return (source: string): keyof T => {
    const choice = values.find((value) => +value === +source);
    if (!choice)
      throw new Error(
        `无效的枚举值, 可用项为:\n` +
          values.map((value) => `${value}->${valueMap[value]}`).join(`\n`),
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

export class ForwardMessageBuilder {
  public static create(name: string, uin: number, ...contents: string[]) {
    return contents.map((content) => ({
      type: "node" as const,
      data: {
        name,
        uin,
        content,
      },
    }));
  }

  protected readonly messages: string[] = [];
  constructor(public readonly name: string, public readonly uin: number) {}

  public add(...contents: string[]) {
    this.messages.push(...contents);
    return this;
  }

  public build() {
    return ForwardMessageBuilder.create(this.name, this.uin, ...this.messages);
  }

  public async send(session?: Session) {
    session = session ?? storage.getStore()?.session;
    if (!session) throw new Error("session not found");
    if (session.onebot && session.guildId) {
      await session.onebot.sendGroupForwardMsg(+session.guildId, this.build());
    } else {
      await Promise.all(this.messages.map((msg) => session?.send(msg)));
    }
  }
}

export const stamp2time = (stamp: number): string =>
  dayjs(stamp).format("llll");
