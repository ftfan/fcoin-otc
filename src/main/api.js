// 在主进程中.
const { ipcMain } = require('electron');
import fs from 'fs';
import path from 'path';

export const ApiConfig = {
  IsDebug: false,
};

let asynchronous;
ipcMain.on('asynchronous-message', (event, arg) => {
  asynchronous = event;
});

ipcMain.on('synchronous-message', (event, arg) => {
  event.returnValue = 'api returnValue ok';
});

(() => {
  try {
    const res = fs.readFileSync(path.join(__static, 'Config.lcn'), 'utf8');
    if (!res) return;
    const data = JSON.parse(res);
    Object.assign(ApiConfig, data);
  } catch (e) {
    return;
  }
})();

ipcMain.on('Sys.IsDebug', (event) => {
  event.returnValue = ApiConfig.IsDebug;
});

class Api {
  constructor () {
    this.handler = ipcMain;
  }

  on (url, fun) {
    this.handler.on(url, fun);
  }

  emit (url, arg) {
    if (asynchronous) asynchronous.sender.send(url, arg);
  }
}

export const ClientApi = new Api();
