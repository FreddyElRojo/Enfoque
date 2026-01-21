// src/main/index.ts
// Punto de entrada principal del proceso main
// Coordina: Prisma, ventana, ciclo de vida y registro de IPCs

import { app, BrowserWindow } from 'electron'
import { optimizer, electronApp} from '@electron-toolkit/utils'
import { createWindow } from './window' // Nueva importación
import { registerIpcHandlers } from './ipc' // Nueva importación (ver abajo)

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Registra todos los handlers IPC (separados en carpeta ipc/)
  registerIpcHandlers()

  // Crea la ventana principal
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})