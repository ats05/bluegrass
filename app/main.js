

const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

import {ipcMain} from "electron";
import {dialog} from "electron";


if(process.env.NODE_ENV === 'develop'){
  crashReporter.start();
}

const rootPath = `file://${__dirname}`;
let mainWindow = null;
let arrowCertificate = false;

app.on('window-all-closed', () => {
  if (process.platform != 'darwin') {
    app.quit();
  }
});

app.on('ready', () => {
  mainWindow = new BrowserWindow({
      width: 1280,
      height: 920,
      allowRunningInsecureContent: true

  });
  mainWindow.loadURL(`${rootPath}/index.html`);
  // mainWindow.webContents.openDevTools();
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

app.on("window-all-closed", () => {
  app.quit();
});

ipcMain.on("click-my-button", (sender, e) => {
  console.log(e);
});

ipcMain.on("fetch-issues", (sender, e) => {
    console.log(e);
});

app.on('certificate-error', function(event, webContents, url, error, certificate, callback) {
    event.preventDefault();
    if(arrowCertificate){
        callback(true);
    }
    else {
        callback(true);
        return ;
        dialog.showMessageBox(mainWindow, {
            title: 'Certificate error',
            message: `Do you trust certificate from "${certificate.issuerName}"?`,
            detail: `URL: ${url}\nError: ${error}`,
            type: 'warning',
            buttons: [
                'Yes',
                'No'
            ],
            cancelId: 1
        }, function (response) {
            if (response === 0) {
                callback(true);
            }
            else {
                callback(false);
            }
        });
    }
});

app.on('login', function(event, webContents, request, authInfo, callback) {
    event.preventDefault();
    callback('UU143986', 'vivi8510');
});