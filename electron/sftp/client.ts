import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import type { ClientType } from "@typed/sftp";

const require = createRequire(import.meta.url);

const { Client } = require("ssh2");

let targetIp: string = "";
let targetPort: number;
let conn: typeof Client;
export function connectServer({ ip, port }: ClientType) {
  return new Promise((resolve, reject) => {
    targetIp = ip;
    targetPort = port || 50021;

    conn = new Client();

    conn
      .on("ready", () => {
        resolve(true);
      })
      .on("error", err => {
        console.log(err);
        reject(err);
      })
      .connect({
        host: targetIp,
        port: targetPort,
        username: "user",
        password: "password",
        passphrase: "user",
        privateKey: readFileSync("rsa", "utf8")
      });
  });
}

export function uploadFile(filePath: string, remotePath: string) {
  return new Promise((resolve, reject) => {
    conn.on("ready", () => {
      const localFilePath = filePath;

      if (!existsSync(localFilePath)) {
        console.error("Local file does not exist:", localFilePath);
        return;
      }

      conn.sftp((err, sftp) => {
        if (err) throw err;

        const remoteFilePath = remotePath;

        sftp.fastPut(localFilePath, remoteFilePath, err => {
          if (err) {
            reject(err);
          }

          resolve(true);
          conn.end();
        });
      });
    });
  });
}
