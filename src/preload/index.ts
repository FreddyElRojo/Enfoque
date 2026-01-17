import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs para el renderer (aquí exponemos lo que React necesita)
const api = {
  // Obtener los settings de la DB
  getSettings: () => ipcRenderer.invoke('get-settings'),

  // Guardar nuevos settings
  updateSettings: (settings: { workTime: number; breakTime: number; longBreak: number }) =>
    ipcRenderer.invoke('update-settings', settings)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)  // ← aquí exponemos nuestro api custom
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}