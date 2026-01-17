import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

// Import estándar de Prisma 6.19.2 (sin output personalizado)
import { PrismaClient } from '@prisma/client'

// Instancia única de Prisma (solo una declaración)
let prisma: PrismaClient

// Configuración de DATABASE_URL (Prisma lo lee automáticamente)
if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
  // DEV: path absoluto temporal (funciona 100% si dev.db existe en esa carpeta)
  const dbPath = 'D:/aplicaciones/Enfoque/enfoque-app/prisma/dev.db'
  process.env.DATABASE_URL = `file:${dbPath}`
  console.log('DEV - DATABASE_URL:', process.env.DATABASE_URL)
} else {
  // PROD: en carpeta de usuario (escritible)
  const dbPath = path.join(app.getPath('userData'), 'enfoque.db')
  process.env.DATABASE_URL = `file:${dbPath}`
  console.log('PROD - DATABASE_URL:', process.env.DATABASE_URL)
}

// Crea la instancia UNA SOLA VEZ
prisma = new PrismaClient()

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 500,
    height: 700,
    show: false,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('ping', () => console.log('pong'))

  // Prueba de conexión a Prisma (elimina el warning y confirma que funciona)
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

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
  // Handler para leer los settings del usuario actual (por ahora asumimos "el único" usuario)
ipcMain.handle('get-settings', async () => {
  try {
    // Buscamos el primer registro (o el único por ahora)
    let settings = await prisma.userSettings.findFirst()

    // Si no existe, creamos el default
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
    throw error // Esto propaga el error al renderer para que lo maneje
  }
})

// Handler para actualizar settings
// Saco "event" del destructuring porque no lo usamos (es solo metadata de IPC)
ipcMain.handle('update-settings', async (_, settings: { workTime: number; breakTime: number; longBreak: number }) => {
  try {
    // Actualizo el registro con ID 1 (por ahora el único)
    // En el futuro: podría recibir userId como parte de settings o usar un contexto
    return await prisma.userSettings.update({
      where: { id: 1 },
      data: settings
    })
  } catch (error) {
    console.error('Error en update-settings:', error)
    throw error
  }
})

ipcMain.handle('log-daily-progress', async (_, hours: number) => {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // inicio del día

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

    // Objetivo: 2 horas o 4 pomodoros (lo ajustamos más adelante)
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})