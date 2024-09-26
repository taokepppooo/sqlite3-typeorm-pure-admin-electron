import { ipcMain } from "electron";

export class IpcMainBridge {
  handle(channel: string, cb: Function) {
    ipcMain.handle(channel, async (event, arg) => {
      try {
        const res = await cb(event, arg);

        if (res) {
          return { success: true, data: res };
        }
      } catch (error) {
        return { success: false, error };
      }
    });
  }
}

export const ipcMainBridge = new IpcMainBridge();
