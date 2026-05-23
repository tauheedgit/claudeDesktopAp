import { contextBridge, ipcRenderer } from 'electron'

const api = {
  windowControls: {
    minimize: () => ipcRenderer.send('window-minimize'),
    maximize: () => ipcRenderer.send('window-maximize'),
    close: () => ipcRenderer.send('window-close'),
    isMaximized: () => ipcRenderer.invoke('window-is-maximized')
  },
  apiCall: (endpoint, options) => ipcRenderer.invoke('api-call', endpoint, options)
}

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer,
  windowControls: api.windowControls
})

contextBridge.exposeInMainWorld('api', api)