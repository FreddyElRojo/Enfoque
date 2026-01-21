// src/main/ipc/streak.ts
// Handler IPC para calcular la racha actual de días con goal cumplido
// Lógica completa: recorre dailyLogs recientes, suma streak, genera mensaje win-win

import { ipcMain } from 'electron'
import {prisma} from '../prisma'

export function registerStreakHandlers() {
  ipcMain.handle('get-current-streak', async () => {
    try {
      // Traemos los últimos 100 dailyLogs ordenados descendente (más reciente primero)
      const logs = await prisma.dailyLog.findMany({
        orderBy: { date: 'desc' },
        take: 100 // límite razonable (más que suficiente para rachas largas)
      })

      if (logs.length === 0) {
        return { streak: 0, message: '¡Empezá hoy tu racha! 🚀' }
      }

      let streak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Recorremos desde el más reciente hacia atrás
      for (let i = 0; i < logs.length; i++) {
        const log = logs[i]
        const logDate = new Date(log.date)
        logDate.setHours(0, 0, 0, 0)

        // Si hay salto >1 día entre logs consecutivos → racha termina aquí
        if (i > 0) {
          const prevDate = new Date(logs[i - 1].date)
          prevDate.setHours(0, 0, 0, 0)
          const diffDays = Math.round((prevDate.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))
          if (diffDays > 1) break
        }

        // Solo sumamos si el goal fue cumplido
        if (log.goalsMet) {
          streak++
        } else {
          // Día parcial o no cumplido: no suma a racha estricta, y corta el loop
          break
        }

        // Caso especial: si hoy no cumplió goal, racha actual = 0
        if (logDate.getTime() === today.getTime() && !log.goalsMet) {
          streak = 0
          break
        }
      }

      // Mensajes win-win: siempre positivos, motivadores, sin culpa
      let message = ''
      if (streak >= 7) {
        message = `¡${streak} días seguidos! Sos una máquina de constancia 🔥`
      } else if (streak >= 3) {
        message = `¡${streak} días seguidos! Vas por muy buen camino 💪`
      } else if (streak > 0) {
        message = `¡${streak} día${streak > 1 ? 's' : ''} seguidos! Seguimos sumando 🌱`
      } else {
        message = '¡Hoy es un gran día para empezar tu racha! 🚀'
      }

      console.log(`Racha calculada: ${streak} días - Mensaje: ${message}`)
      return { streak, message }
    } catch (error) {
      console.error('Error en get-current-streak:', error)
      return { streak: 0, message: '¡Seguimos sumando!' }
    }
  })
}