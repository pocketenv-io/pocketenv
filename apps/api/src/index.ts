import express from "express";
import consola from "consola";

const app = express();

app.get("/", (req, res) => {
  res.send(`
      ___           __       __
     / _ \\___  ____/ /_____ / /____ ___ _  __
    / ___/ _ \\/ __/  '_/ -_) __/ -_) _ \\ |/ /
   /_/   \\___/\\__/_/\\_\\__/\\__/\\__/_/ /_/___/

    `);
});

app.listen(process.env.POCKETENV_XPRC_PORT || 8789, () => {
  consola.info(
    `Pocketenv XRPC API is running on port ${process.env.POCKETENV_XRPC_PORT || 8789}`,
  );
});
