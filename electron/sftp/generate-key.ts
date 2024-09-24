import { createRequire } from "node:module";
import fs from "node:fs";

const require = createRequire(import.meta.url);

const { utils } = require("ssh2");

const { generateKeyPair } = utils;

generateKeyPair("rsa", { bits: 2048, passphrase: "user", cipher: "aes256-cbc" }, (err, keys) => {
  if (err) throw err;

  fs.writeFileSync("rsa.pub", Buffer.from(keys.public, "utf8"));
  fs.writeFileSync("rsa", Buffer.from(keys.private, "utf8"));
});
