import { hibi } from "../network";

/**
 * @author mcfx
 * @author lm902 <i@lm902.cn>
 * @link <https://github.com/lm902/bilibili-bv-av-convert/blob/master/index.js>
 */
export class BilibiliVideoIDUtils {
  protected static table =
    "fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF";
  protected static reverse = Object.fromEntries(
    Array.from(this.table).map((char, index) => [char, index]),
  );
  protected static s = [11, 10, 3, 8, 4, 6];
  protected static xor = 177451812;
  protected static add = 8728348608;

  public static bv2av(bv: string): number {
    const sum = new Uint8Array(6).reduce(
      (value, _, index) =>
        value + this.reverse[bv[this.s[index]]] * 58 ** index,
      0,
    );
    return (sum - this.add) ^ this.xor;
  }

  public static av2bv(av: number): string {
    return new Uint8Array(6)
      .reduce((value, _, index) => {
        value.splice(
          this.s[index],
          1,
          this.table[
            Math.floor((((av ^ this.xor) + this.add) / 58 ** index) % 58)
          ],
        );
        return value;
      }, Array.from("BV1  4 1 7  "))
      .join("");
  }
}

export async function matchVideoId(
  message: string,
): Promise<number | undefined> {
  let match: RegExpMatchArray | null = null,
    aid: number | undefined = undefined;

  if ((match = message.match(/[aA][vV](?<aid>\d{1,12})/))) {
    aid = +(match.groups?.aid as string);
  } else if ((match = message.match(/[bB][vV]([a-zA-Z0-9]{8,12})/))) {
    const [bvid] = match;
    aid = BilibiliVideoIDUtils.bv2av(bvid);
  } else if ((match = message.match(/https?:\/\/b23\.tv\/\w{4,8}/))) {
    const [url] = match;
    const location = await hibi
      .get(url, { maxRedirects: 0, validateStatus: (status) => status === 302 })
      .then(({ headers }) => headers.location)
      .catch(() => undefined);
    aid = location ? await matchVideoId(location) : undefined;
  }

  return Number.isInteger(aid) && (aid as number) > 0 ? aid : undefined;
}
