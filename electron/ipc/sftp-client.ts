import { ipcMainBridge } from "./common";
import { connectClient, uploadFile } from "@electron/sftp/client";

ipcMainBridge.handle("connect-client", async ({ ip, port }) => {
  await connectClient({ ip, port });
});

ipcMainBridge.handle("upload-file", async ({ filePath, remotePath }) => {
  return await uploadFile(filePath, remotePath);
});
