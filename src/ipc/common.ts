import { ipcRenderer } from "electron";

class IpcRefererBridge {
  async invoke(channel: string, args: Object) {
    return await ipcRenderer.invoke(channel, args);
  }
}

export const ipcRefererBridge = new IpcRefererBridge();
