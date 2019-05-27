//在渲染器进程 (网页) 中。
import { ipcRenderer } from 'electron';

console.log(ipcRenderer.sendSync('synchronous-message', 'ping')); // prints "pong"

// 注册监听
ipcRenderer.send('asynchronous-message', 'ping');

class Api {
  on (url: string, callback: any) {
    ipcRenderer.on(url, callback);
  }

  emit (url: string, arg: any) {
    return ipcRenderer.sendSync(url, arg);
  }
}

export const ipc = new Api();