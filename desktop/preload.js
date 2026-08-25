const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  promptTouchID: (reason) => ipcRenderer.invoke('prompt-touch-id', reason),
  canPromptTouchID: () => ipcRenderer.invoke('can-prompt-touch-id'),
});
