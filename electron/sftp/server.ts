import { timingSafeEqual } from "node:crypto";
import { createRequire } from "node:module";
import { readFileSync, existsSync, openSync, closeSync, writeSync } from "node:fs";
import log from "electron-log/main";
import { getLocalIp, pollingCheck } from "@electron/network/ip";

const require = createRequire(import.meta.url);

const {
  Server,
  utils: {
    sftp: { STATUS_CODE },
    parseKey
  }
} = require("ssh2");

const allowedUser = Buffer.from("user");
const allowedPassword = Buffer.from("password");
const allowedPubKey = parseKey(readFileSync("rsa.pub", "utf8"));

function checkValue(input, allowed) {
  const autoReject = input.length !== allowed.length;
  if (autoReject) {
    // Prevent leaking length information by always making a comparison with the
    // same input when lengths don't match what we expect ...
    allowed = input;
  }
  const isMatch = timingSafeEqual(input, allowed);
  return !autoReject && isMatch;
}

export function createServer(ip, port) {
  const server = new Server(
    {
      hostKeys: [{ key: readFileSync("rsa"), passphrase: "user" }]
    },
    client => {
      log.info(`SFTP Client connected! ip:${client._sock.remoteAddress}`);

      client
        .on("authentication", ctx => {
          let allowed = true;
          if (!checkValue(Buffer.from(ctx.username), allowedUser)) allowed = false;

          switch (ctx.method) {
            case "password":
              if (!checkValue(Buffer.from(ctx.password), allowedPassword)) return ctx.reject();
              break;
            case "publickey":
              if (
                ctx.key.algo !== allowedPubKey.type ||
                !checkValue(ctx.key.data, allowedPubKey.getPublicSSH()) ||
                (ctx.signature && allowedPubKey.verify(ctx.blob, ctx.signature, ctx.hashAlgo) !== true)
              ) {
                return ctx.reject();
              }
              break;
            default:
              return ctx.reject();
          }

          if (allowed) ctx.accept();
          else ctx.reject();
        })
        .on("ready", () => {
          log.info(`SFTP Client authenticated! ip:${client._sock.remoteAddress}`);

          client.on("session", (accept, _reject) => {
            const session = accept();
            session.on("sftp", (accept, _reject) => {
              log.info(`SFTP Client session! ip:${client._sock.remoteAddress}`);
              const sftp = accept();
              const handles = {};

              sftp.on("OPEN", (reqid, filename, flags) => {
                try {
                  let nodeFlags = "w";

                  if (flags && !existsSync(filename)) {
                    nodeFlags = "w";
                  }

                  const fd = openSync(filename, nodeFlags);
                  const handle = Buffer.alloc(4);
                  handle.writeUInt32BE(fd, 0);
                  handles[handle.toString("hex")] = fd;
                  sftp.handle(reqid, handle);
                } catch (err) {
                  sftp.status(reqid, STATUS_CODE.FAILURE);
                  log.error(`Server OPEN: ${err}`);
                }
              });

              sftp.on("WRITE", (reqid, handle, offset, data) => {
                const fd = handles[handle.toString("hex")];
                if (fd === undefined) {
                  sftp.status(reqid, STATUS_CODE.FAILURE);
                  return;
                }
                try {
                  writeSync(fd, data, 0, data.length, offset);
                  sftp.status(reqid, STATUS_CODE.OK);
                } catch (err) {
                  sftp.status(reqid, STATUS_CODE.FAILURE);
                  log.error(`Server WRITE: ${err}`);
                }
              });

              sftp.on("CLOSE", (reqid, handle) => {
                const fd = handles[handle.toString("hex")];
                if (fd === undefined) {
                  sftp.status(reqid, STATUS_CODE.FAILURE);
                  log.error(`Server CLOSE: ${STATUS_CODE.FAILURE}`);
                  return;
                }
                closeSync(fd);
                // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
                delete handles[handle.toString("hex")];
                sftp.status(reqid, STATUS_CODE.OK);
              });
            });
          });
        })
        .on("close", () => {
          log.info(`SFTP Client disconnected! ip:${client._sock.remoteAddress}`);
        });
    }
  ).listen(port, ip, function () {
    log.info(`SFTP Listening on port! port:${this.address().port}`);
  });

  return server;
}

export function initServer(port = 50021) {
  const server = createServer(getLocalIp(), port);

  if (server) {
    pollingCheck((ip: string) => {
      log.info("IP changed, restarting server!");
      server.close();
      createServer(ip, port);
    });
  }
}
