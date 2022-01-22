// organize-imports-ignore
import * as dotenv from "dotenv";
import { App, Logger } from "koishi";
import "./src/patch-template";
import { inspect } from "util";

import onebot from "@koishijs/plugin-adapter-onebot";
import * as gocqhttp from "koishi-plugin-gocqhttp";

import sqlite from "@koishijs/plugin-database-sqlite";

import console from "@koishijs/plugin-console";
import * as chat from "@koishijs/plugin-chat";
import * as status from "@koishijs/plugin-status";

import * as hibi from "./src/plugin-hibi";
import * as imageSearch from "./src/plugin-image-search";
import * as thesaurus from "./src/thesaurus";

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
app.plugin(chat);
app.plugin(status);
app.plugin(console);

app.plugin(hibi);
app.plugin(imageSearch);
app.plugin(thesaurus);

app.start();
