import { ipcMainBridge } from "./common";
import { initServer } from "@electron/sftp/server";

ipcMainBridge.on("init-server", (port: number) => {
  initServer(port);
});
