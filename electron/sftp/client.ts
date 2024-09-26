import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import type { ClientType } from "@typed/sftp";
import log from "electron-log/main";

const require = createRequire(import.meta.url);

const { Client } = require("ssh2");

let targetIp: string = "";
let targetPort: number;
let conn: typeof Client;
let isConnected = false;
export function connectServer({ ip, port }: ClientType) {
  return new Promise((resolve, reject) => {
    targetIp = ip;
    targetPort = port || 50021;

    conn = new Client();

    conn
      .on("ready", () => {
        log.info("Connected to remote server!");
        isConnected = true;
        resolve(true);
      })
      .on("error", err => {
        log.error("Failed to connect to remote server:", err);
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

export function uploadFile(filePath: string, remotePath: string, type = "db-sync") {
  return new Promise((resolve, reject) => {
    if (isConnected) {
      const localFilePath = filePath;

      if (!existsSync(localFilePath)) {
        console.error("Local file does not exist:", localFilePath);
        return;
      }

      conn.sftp((err, sftp) => {
        if (err) throw err;

        // 将参数拼接为文件名
        const remoteFilePath = `${remotePath}?type=${type}`;

        sftp.fastPut(localFilePath, remoteFilePath, err => {
          if (err) {
            reject(err);
          }

          log.info("Uploaded file to remote server:", remoteFilePath);
          conn.end();
          resolve(true);
        });
      });
    }
  });
}
