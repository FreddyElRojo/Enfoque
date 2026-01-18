/*Este archivo es el cerebro y punto de entrada principal del proceso main de Electron.
Es el primer código que se ejecuta cuando la app arranca y tiene responsabilidad total sobre:

Crear y gestionar la ventana principal (tamaño, transparencia, frame, preload).
Configurar el entorno (dev vs prod) y la conexión a la base de datos SQLite vía Prisma.
Instanciar Prisma Client (única instancia global para toda la app).
Registrar todos los handlers IPC que permiten la comunicación segura entre el proceso main (donde está la DB) y el renderer (React).
Manejar el ciclo de vida de la app (ready, activate, window-all-closed).
Ejecutar pruebas iniciales de conexión a la DB y crear defaults si es necesario.

Relación con el resto del proyecto:

Habla directamente con Prisma para leer/escribir en la DB (settings, daily log, progreso parcial).
Expone APIs seguras al renderer vía IPC (get-settings, update-settings, log-daily-progress, get-daily-log).
Usa el preload para que el renderer solo pueda llamar estas funciones controladas (seguridad).
Es el único lugar donde se configura la ventana y el entorno (dev/prod), afectando toda la experiencia visual y de persistencia.*/

// Importaciones básicas de Electron (para crear ventanas, manejar eventos, IPC, etc.)
import { app, shell, BrowserWindow, ipcMain } from 'electron'

// Herramientas para manejar paths y rutas de archivos (join es para paths seguros)
import { join } from 'path'
import path from 'path'

// Utilidades del toolkit oficial de Electron (optimizaciones, detección de dev/prod, etc.)
import { electronApp, optimizer, is } from '@electron-toolkit/utils'

// Icono de la app (importado como asset con Vite)
import icon from '../../resources/icon.png?asset'

// Import de Prisma Client (conexión a la DB SQLite local)
import { PrismaClient } from '@prisma/client'

// Variable global para la instancia única de Prisma (patrón singleton para evitar múltiples conexiones)
let prisma: PrismaClient

// Configuración del path de la base de datos según entorno (dev vs prod)
// Esto es crítico: Prisma lee automáticamente process.env.DATABASE_URL
if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
  // En desarrollo: usamos path absoluto temporal (fácil de debuggear, apunta a prisma/dev.db en la raíz del proyecto)
  const dbPath = 'D:/aplicaciones/Enfoque/enfoque-app/prisma/dev.db'
  process.env.DATABASE_URL = `file:${dbPath}`
  console.log('DEV - DATABASE_URL:', process.env.DATABASE_URL) // Log para debug
} else {
  // En producción (app empaquetada): DB en la carpeta de datos del usuario (escritible, no se borra al actualizar la app)
  const dbPath = path.join(app.getPath('userData'), 'enfoque.db')
  process.env.DATABASE_URL = `file:${dbPath}`
  console.log('PROD - DATABASE_URL:', process.env.DATABASE_URL) // Log para debug en prod
}

// Instancia única de Prisma (se crea solo una vez, al inicio del main process)
prisma = new PrismaClient()

// Función que crea la ventana principal de la app
function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 500,                     // Tamaño compacto y minimalista
    height: 1000,                   // Alto para dar espacio a la UI
    show: false,                    // Oculta al inicio (se muestra en 'ready-to-show')
    frame: false,                   // Sin bordes ni barra de título (estética limpia)
    transparent: true,              // Fondo completamente transparente (vidrio esmerilado)
    backgroundColor: '#00000000',   // Color de fondo transparente (necesario para transparent: true)
    autoHideMenuBar: true,          // Oculta la barra de menú por defecto
    ...(process.platform === 'linux' ? { icon } : {}), // Icono solo en Linux
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'), // Preload script (seguridad + exposición de APIs)
      sandbox: false                  // Necesario para algunos módulos nativos
    }
  })

  // Evento: cuando la ventana está lista para mostrarse (evita flash blanco)
  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Bloquea apertura de enlaces externos en la misma ventana (seguridad)
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Carga la UI según entorno
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    // En desarrollo: carga desde el servidor Vite (hot module replacement)
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    // En producción: carga el archivo HTML compilado
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Cuando la app está lista (después de inicialización completa)
app.whenReady().then(async () => {
  // ID de la app para Windows (taskbar, notificaciones, etc.)
  electronApp.setAppUserModelId('com.electron')

  // Optimiza shortcuts (F12 para DevTools, Ctrl+R ignorado en prod)
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC de prueba simple (ping-pong)
  ipcMain.on('ping', () => console.log('pong'))

  // Prueba inicial de conexión a Prisma (crea default si no existe)
  try {
    let settings = await prisma.userSettings.findFirst()
    if (!settings) {
      console.log('Creando settings default...')
      settings = await prisma.userSettings.create({
        data: {
          workTime: 25,
          breakTime: 5,
          longBreak: 15
        }
      })
    }
    console.log('✅ Settings desde DB:', settings)
  } catch (error) {
    console.error('❌ Error Prisma:', error)
  }

  // Crea la ventana principal
  createWindow()

  // En macOS: re-crea ventana si se cierra todas y se hace clic en el dock
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // IPC: Obtener los settings actuales (o crea default si no existe)
  ipcMain.handle('get-settings', async () => {
    try {
      let settings = await prisma.userSettings.findFirst()
      if (!settings) {
        settings = await prisma.userSettings.create({
          data: {
            workTime: 25,
            breakTime: 5,
            longBreak: 15
          }
        })
      }
      return settings
    } catch (error) {
      console.error('Error en get-settings:', error)
      throw error
    }
  })

  // IPC: Actualizar los settings (solo ID 1 por ahora)
  ipcMain.handle('update-settings', async (_, settings: { workTime: number; breakTime: number; longBreak: number }) => {
    try {
      return await prisma.userSettings.update({
        where: { id: 1 },
        data: settings
      })
    } catch (error) {
      console.error('Error en update-settings:', error)
      throw error
    }
  })

  // IPC: Registrar progreso parcial del día (suma horas trabajadas)
  ipcMain.handle('log-daily-progress', async (_, hours: number) => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0) // Normaliza a inicio del día

      let log = await prisma.dailyLog.findFirst({
        where: { date: today }
      })

      if (!log) {
        log = await prisma.dailyLog.create({
          data: {
            date: today,
            hoursWorked: 0,
            goalsMet: false,
            streak: 0
          }
        })
      }

      const newHours = log.hoursWorked + hours

      // Objetivo simple: 2 horas totales por día para marcar como completado
      const goalsMet = newHours >= 2

      await prisma.dailyLog.update({
        where: { id: log.id },
        data: {
          hoursWorked: newHours,
          goalsMet
        }
      })

      return { success: true, hoursWorked: newHours, goalsMet }
    } catch (error) {
      console.error('Error en log-daily-progress:', error)
      throw error
    }
  })

  // IPC: Obtener el registro del día actual (para progreso parcial)
  ipcMain.handle('get-daily-log', async (_, date: Date) => {
    try {
      const log = await prisma.dailyLog.findFirst({
        where: { date }
      })
      return log
    } catch (error) {
      console.error('Error get-daily-log:', error)
      throw error
    }
  })
})

// Cierra la app cuando se cierran todas las ventanas (excepto macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})