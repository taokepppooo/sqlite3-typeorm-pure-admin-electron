import { ipcMainBridge } from "./common";
import { initServer } from "@electron/sftp/server";

ipcMainBridge.handle("init-server", ({ port }) => {
  initServer(port);
});
