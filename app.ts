import onebot from "@koishijs/plugin-adapter-onebot";
import * as chat from "@koishijs/plugin-chat";
import * as common from "@koishijs/plugin-common";
import * as console from "@koishijs/plugin-console";
import sqlite from "@koishijs/plugin-database-sqlite";
import * as gocqhttp from "@koishijs/plugin-gocqhttp";
import * as manager from "@koishijs/plugin-manager";
import * as dotenv from "dotenv";
import { App, Logger } from "koishi";
import { inspect } from "util";
import "./src/patch-template";
import * as hibi from "./src/plugin-hibi";
import * as imageSearch from "./src/plugin-image-search";

dotenv.config();

if (process.env.LOG_LEVEL)
  Logger.levels.base = Logger[process.env.LOG_LEVEL.toUpperCase()];

Logger.formatters["o"] = (value, target?: Logger.Target) =>
  inspect(value, { colors: !!target?.colors, maxStringLength: 256 }).replace(
    /\s*\n\s*/g,
    " ",
  );

const app = new App({ port: 3000, prettyErrors: true });

app.plugin(gocqhttp);
app.plugin(onebot, {
  protocol: "ws-reverse",
  selfId: process.env.ONEBOT_SELF_ID,
  endpoint: process.env.ONEBOT_ENDPOINT,
  password: process.env.GOCQHTTP_PASSWORD,
});

app.plugin(sqlite);
app.plugin(console);
app.plugin(manager);
app.plugin(chat);
app.plugin(common);

app.plugin(hibi);
app.plugin(imageSearch);

app.start();
