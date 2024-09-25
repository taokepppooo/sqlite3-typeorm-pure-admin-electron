import { ipcMainBridge } from "./common";
import { connectServer, uploadFile } from "@electron/sftp/client";

ipcMainBridge.handle("connect-server", async (_, { ip, port }) => {
  await connectServer({ ip, port });
});

ipcMainBridge.handle("upload-file", async (_, { filePath, remotePath }) => {
  return await uploadFile(filePath, remotePath);
});
