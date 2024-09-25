import { ipcRefererBridge } from "./common";

export const initServer = async (port?: number) => {
  return await ipcRefererBridge.invoke("init-server", { port });
};
