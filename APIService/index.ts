import Express from "express";
import https from "https";
import config from "./utils/config";

const app = Express();

app.listen(config.BACKEND_PORT, () => {
  console.log(`App live at ${config.BACKEND_PORT}`);
});
