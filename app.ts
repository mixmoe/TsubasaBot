import onebot from "@koishijs/plugin-adapter-onebot";
import * as chat from "@koishijs/plugin-chat";
import * as common from "@koishijs/plugin-common";
import sqlite from "@koishijs/plugin-database-sqlite";
import * as gocqhttp from "@koishijs/plugin-gocqhttp";
import * as dotenv from "dotenv";
import { App, Logger } from "koishi";
import "./src/patch-segment";
import "./src/patch-template";
import * as hibi from "./src/plugin-hibi";
import * as imageSearch from "./src/plugin-image-search";

dotenv.config();

if (process.env.LOG_LEVEL)
  Logger.levels.base = Logger[process.env.LOG_LEVEL.toUpperCase()];

const app = new App({ port: 3000, prettyErrors: true });

app.plugin(onebot, {
  protocol: "ws-reverse",
  selfId: process.env.ONEBOT_SELF_ID,
  endpoint: process.env.ONEBOT_ENDPOINT,
  password: process.env.GOCQHTTP_PASSWORD,
});

app.plugin(sqlite);
app.plugin(gocqhttp);
app.plugin(common);
app.plugin(chat);
app.plugin(hibi);
app.plugin(imageSearch);

app.start();
