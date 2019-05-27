import { app, BrowserWindow, Menu, powerSaveBlocker, Notification } from 'electron';
import { menu } from './menu';
import { TrayInit } from './evt';
import log from 'electron-log';
// import { InstallUpdate } from './update';
import path from 'path';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`;

function createWindow () {
  mainWindow = new BrowserWindow({
    height: 880,
    width: 1366,
    // opacity: 0.95,
    title: app.getName(),
    icon: path.join(__static, './256x256.png'),
    // transparent: true,
    webPreferences: {
      devTools: true,
    },
  });

  mainWindow.loadURL(winURL);
  Menu.setApplicationMenu(menu);
  let id = powerSaveBlocker.start('prevent-app-suspension');

  // 每分钟检查系统是否会睡眠
  setInterval(() => {
    if (!powerSaveBlocker.isStarted(id)) {
      id = powerSaveBlocker.start('prevent-app-suspension');
    }
  }, 6000);

  log.debug('mainWindow created');

  TrayInit(mainWindow);
  // InstallUpdate(mainWindow);

  mainWindow.on('closed', () => {
    log.debug('mainWindow on close');
    powerSaveBlocker.stop(id);
    mainWindow = null
  });
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
