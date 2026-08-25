const { app, BrowserWindow, ipcMain, systemPreferences } = require('electron');
const path = require('path');

// IPC Handlers for Native macOS Touch ID
ipcMain.handle('prompt-touch-id', async (event, reason) => {
  if (process.platform === 'darwin' && systemPreferences.canPromptTouchID && systemPreferences.canPromptTouchID()) {
    try {
      await systemPreferences.promptTouchID(reason || 'Authenticate with Touch ID');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: 'Touch ID hardware not supported or not enrolled on this Mac' };
});

ipcMain.handle('can-prompt-touch-id', async () => {
  if (process.platform === 'darwin' && systemPreferences.canPromptTouchID) {
    return systemPreferences.canPromptTouchID();
  }
  return false;
});

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
      preload: path.join(__dirname, 'preload.js'),
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
