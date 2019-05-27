import { Tray, Menu } from 'electron';
import path from 'path';
import { ClientApi } from './api';

export const TrayInit = (mainWindow) => {
  const tray = new Tray(path.join(__static, './icon.ico'));
  const trayContextMenu = Menu.buildFromTemplate([
    {
      label: '打开',
      click: () => {
        mainWindow.show();
      }
    }, {
      label: '退出',
      click: () => {
        mainWindow.close();
      }
    }
  ]);
  tray.setToolTip('FCoinOTC');

  var count = 0;
  var flash = 0;
  const flashHandler = () => {
    if (count++ % 2 === 0) {
      tray.setImage(path.join(__static, './icon.ico'));
    } else {
      tray.setImage(path.join(__static, './icon.h.ico'));
    }
  };

  tray.on('click', () => {
    clearInterval(flash);
    mainWindow.show();
  });
  tray.on('right-click', () => {
    tray.popUpContextMenu(trayContextMenu);
  });

  ClientApi.on('/Open/Url', (event) => {
    // require('electron').shell.openExternal('https://www.ftfan.org/forum.php?mod=viewthread&tid=1848')
    return event.returnValue = true;
  });

  ClientApi.on('/Open/Flash', (event) => {
    clearInterval(flash);
    tray.setImage(path.join(__static, './icon.ico'));
    flash = setInterval(flashHandler, 400);
    return event.returnValue = true;
  });

  ClientApi.on('/Open/F12', (event) => {
    mainWindow.webContents.openDevTools();
    return event.returnValue = true;
  });
};
