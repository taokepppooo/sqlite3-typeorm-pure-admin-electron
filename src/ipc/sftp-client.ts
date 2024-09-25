import { ipcRefererBridge } from "./common";
import type { ClientType } from "@typed/sftp";

export const connectServer = async ({ ip, port }: ClientType) => {
  return await ipcRefererBridge.invoke("connect-server", { ip, port });
};

export const uploadFile = async (filePath: string, remotePath: string) => {
  return await ipcRefererBridge.invoke("upload-file", { filePath, remotePath });
};
