import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";

export interface ClientType {
  ip: string;
  port?: number;
}

const require = createRequire(import.meta.url);

const { Client } = require("ssh2");

let targetIp: string = "";
let targetPort: number = 50021;
let conn: typeof Client;
export function connectClient({ ip, port }: ClientType) {
  return new Promise((resolve, reject) => {
    targetIp = ip;
    targetPort = port;

    conn = new Client();

    conn.connect({
      host: targetIp,
      port: targetPort,
      username: "user",
      password: "password",
      passphrase: "user",
      privateKey: readFileSync("rsa", "utf8")
    });

    conn.on("ready", () => {
      resolve(true);
    });

    conn.on("error", err => {
      reject(err);
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
