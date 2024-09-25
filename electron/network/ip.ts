import os from "node:os";

let ip: string = "";
let currentIp: string = "";

export const getLocalIp = (): string => {
  ip = "";

  const networkInterfaces = os.networkInterfaces();

  for (const key in networkInterfaces) {
    const iface = networkInterfaces[key];

    if (iface) {
      for (const alias of iface) {
        if (alias.family === "IPv4" && !alias.internal) {
          ip = alias.address;
          return ip;
        }
      }
    }
  }
};

export const checkForIpChange = cb => {
  currentIp = getLocalIp();

  if (ip !== currentIp) {
    ip = currentIp;
    cb(ip);
  }
};

export const pollingCheck = cb => {
  setInterval(() => {
    checkForIpChange(cb);
  }, 5000);
};
