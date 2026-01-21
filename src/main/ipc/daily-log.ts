import { ipcMain } from 'electron'
import {prisma} from '../prisma'

export function registerDailyLogHandlers() {
  ipcMain.handle('log-daily-progress', async (_, hours: number) => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

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
}