import { ipcRefererBridge } from "./common";

export const initServer = (port?: number) => {
  return ipcRefererBridge.send("init-server", { port });
};
