import { App } from "koishi";
import * as dotenv from "dotenv";
import * as onebot from "@koishijs/plugin-adapter-onebot";
import * as common from "@koishijs/plugin-common";
import * as chat from "@koishijs/plugin-chat";
import * as helloWorld from "./src/hello-world";

dotenv.config();

const app = new App();

app.plugin(onebot, {
  protocol: "ws",
  selfId: process.env.ONEBOT_SELF_ID,
  endpoint: process.env.ONEBOT_ENDPOINT,
});
app.plugin(common);
app.plugin(chat);
app.plugin(helloWorld);

app.start();
