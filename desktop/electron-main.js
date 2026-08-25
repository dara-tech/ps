const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1060,
    height: 780,
    minWidth: 920,
    minHeight: 660,
    title: 'Quantum Enterprise',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 18, y: 18 },
    backgroundColor: '#D6E2E4',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the React Native / Expo Desktop Application
  win.loadURL('http://localhost:8081');

  win.webContents.on('did-fail-load', () => {
    setTimeout(() => {
      win.loadURL('http://localhost:8081');
    }, 1500);
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
