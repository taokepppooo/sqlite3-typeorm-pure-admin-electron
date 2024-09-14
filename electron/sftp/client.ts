import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import log from "electron-log/main";

const require = createRequire(import.meta.url);

const { Client } = require("ssh2");

export function connectClient() {
  const conn = new Client();

  const localFilePath = "package.json";

  if (!existsSync(localFilePath)) {
    console.error("Local file does not exist:", localFilePath);
    return;
  }

  conn
    .on("ready", () => {
      log.info("Client connect ready");

      conn.sftp((err, sftp) => {
        if (err) throw err;

        const remoteFilePath = "packagesss.json";

        sftp.fastPut(localFilePath, remoteFilePath, err => {
          if (err) throw err;
          conn.end();
        });
      });
    })
    .connect({
      host: "192.168.50.227",
      port: 50021,
      username: "user",
      password: "password",
      passphrase: "user",
      privateKey: readFileSync("rsa", "utf8")
    });
}
