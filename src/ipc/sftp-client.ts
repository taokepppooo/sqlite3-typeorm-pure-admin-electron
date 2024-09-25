import { ipcRefererBridge } from "./common";
import type { ClientType } from "../../electron/sftp/client";

export const connectClient = async ({ ip, port }: ClientType) => {
  return await ipcRefererBridge.invoke("connect-client", { ip, port });
};

export const uploadFile = async (filePath: string, remotePath: string) => {
  return await ipcRefererBridge.invoke("upload-file", { filePath, remotePath });
};
