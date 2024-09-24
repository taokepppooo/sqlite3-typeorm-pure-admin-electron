import { ipcMain } from "electron";

export class IpcMainBridge {
  on(channel: string, cb: Function) {
    ipcMain.on(channel, (event, arg) => {
      cb(event, arg);
    });
  }
}

export const ipcMainBridge = new IpcMainBridge();
