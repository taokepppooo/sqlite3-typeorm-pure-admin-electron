import { ipcRenderer } from "electron";

class IpcRefererBridge {
  send(channel: string, args: Object) {
    ipcRenderer.send(channel, args);
  }
}

export const ipcRefererBridge = new IpcRefererBridge();
