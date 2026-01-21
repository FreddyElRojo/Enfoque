import { ipcMain } from 'electron'
import {prisma} from '../prisma'

export function registerSettingsHandlers() {
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
}