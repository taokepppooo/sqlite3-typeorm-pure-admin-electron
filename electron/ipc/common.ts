import { ipcMain } from "electron";

export class IpcMainBridge {
  handle(channel: string, cb: Function) {
    ipcMain.handle(channel, (event, arg) => {
      try {
        cb(event, arg);
        return { success: true };
      } catch (error) {
        return { success: false, error };
      }
    });
  }
}

export const ipcMainBridge = new IpcMainBridge();
