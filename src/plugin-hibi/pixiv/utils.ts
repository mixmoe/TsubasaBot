import { segment, Session, template } from "koishi";
import {
  cardImageSegment,
  constructForwardMessage,
  imageSegment,
} from "../utils";

export async function sendMultipleImages(
  session: Session,
  images: (string | { desc: string; url: string })[]
) {
  const imageMessages = images
    .map((image, index) =>
      typeof image === "string"
        ? { desc: template("hibi.pixiv.pageCount", index + 1), url: image }
        : image
    )
    .map(({ desc, url }) =>
      template("hibi.pixiv.imageSent", {
        desc,
        image: segment("image", { file: url }),
      })
    );

  if (!session.userId || !session.onebot) throw new Error("no onebot");

  if (session.guildId) {
    await session.onebot.sendGroupForwardMsg(
      session.guildId,
      constructForwardMessage(
        session.username,
        +session.userId,
        ...imageMessages
      )
    );
  } else {
    await Promise.all(
      imageMessages.map((image) => session.send(image).catch())
    );
  }
}
