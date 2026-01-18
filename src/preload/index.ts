/*Este archivo es el "puente de seguridad" entre el proceso main (donde está la lógica sensible: DB, Prisma, archivos del sistema) y el proceso renderer (React, la UI visible).
Su único propósito es exponer de forma controlada y segura ciertas funciones del main process al renderer, usando contextBridge.
Esto es una medida de seguridad crítica en Electron: sin preload, el renderer tendría acceso directo a módulos peligrosos (fs, child_process, etc.), lo que podría permitir ataques o fugas de datos.
Relación con el resto del proyecto:

Se ejecuta antes que el renderer (React) cargue.
Crea dos objetos en window:
window.electron: API oficial del toolkit (ipcRenderer, shell, etc.).
window.api: Nuestros métodos custom (getSettings, updateSettings, logDailyProgress, getDailyLog) que llaman al main vía IPC.

El renderer (App.tsx, hooks, componentes) usa solo estos métodos expuestos (nunca accede directamente a Prisma o a la DB).
Todo lo que expone es solo lectura/escritura controlada (nada de fs directo o ejecución de comandos).
Si context isolation está desactivado (raro, pero posible en dev), agrega los objetos directamente a window (fallback inseguro).*/


// Importamos las herramientas básicas para exponer APIs de forma segura
import { contextBridge, ipcRenderer } from 'electron'

// Importamos el API oficial del toolkit de Electron (contiene métodos seguros como ipcRenderer, shell, etc.)
import { electronAPI } from '@electron-toolkit/preload'

// Definimos el objeto api custom que vamos a exponer al renderer
// Este objeto contiene solo funciones seguras que llaman al main vía IPC
// Cada método corresponde a un handler en src/main/index.ts
const api = {
  // Obtiene los settings actuales de la DB (o crea default si no existe)
  // Retorna Promise con el objeto settings
  getSettings: () => ipcRenderer.invoke('get-settings'),

  // Actualiza los settings en la DB
  // Recibe un objeto con workTime, breakTime, longBreak
  updateSettings: (settings: { workTime: number; breakTime: number; longBreak: number }) =>
    ipcRenderer.invoke('update-settings', settings),

  // Registra progreso parcial del día (suma horas trabajadas)
  // Llamado cada 30 segundos desde renderer durante modo work
  logDailyProgress: (hours: number) => 
    ipcRenderer.invoke('log-daily-progress', hours),

  // Obtiene el registro completo del día actual (para mostrar progreso parcial en UI)
  getDailyLog: (date: Date) => ipcRenderer.invoke('get-daily-log', date)
}

// Lógica de exposición segura
// Electron recomienda usar contextBridge cuando contextIsolation está activado (por defecto en versiones modernas)
// Esto evita que el renderer tenga acceso directo a módulos peligrosos (fs, child_process, etc.)
if (process.contextIsolated) {
  try {
    // Exponemos el API oficial del toolkit (electronAPI)
    // Contiene métodos seguros como ipcRenderer, shell, webFrame, etc.
    contextBridge.exposeInMainWorld('electron', electronAPI)

    // Exponemos nuestro API custom (getSettings, updateSettings, logDailyProgress, getDailyLog)
    // El renderer solo puede usar estos métodos, nada más
    contextBridge.exposeInMainWorld('api', api)  // ← Punto clave de seguridad
  } catch (error) {
    console.error('Error al exponer APIs en contextBridge:', error)
  }
} else {
  // Fallback (muy raro en versiones modernas, solo para compatibilidad antigua)
  // Si contextIsolation está desactivado (no recomendado por seguridad)
  // Agregamos directamente a window (menos seguro, pero funciona)
  // @ts-ignore porque TS no lo reconoce en modo no-isolated
  window.electron = electronAPI
  // @ts-ignore
  window.api = api
}