import { ipcMain } from 'electron'
import {prisma} from '../prisma'

export function registerTaskHandlers() {
  ipcMain.handle('create-task', async (_, task: { description: string; estimatedMinutes: number }) => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (task.description.length > 200) {
        throw new Error('La descripción no puede superar los 200 caracteres')
      }
      if (task.estimatedMinutes < 1 || task.estimatedMinutes > 120) {
        throw new Error('El tiempo estimado debe estar entre 1 y 120 minutos')
      }

      const newTask = await prisma.task.create({
        data: {
          description: task.description,
          estimatedMinutes: task.estimatedMinutes,
          date: today,
        }
      })

      console.log('Tarea creada:', newTask)
      return newTask
    } catch (error) {
      console.error('Error creando tarea:', error)
      throw error
    }
  })

  ipcMain.handle('get-tasks-today', async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const tasks = await prisma.task.findMany({
        where: { date: today },
        orderBy: { createdAt: 'asc' }
      })

      console.log(`Tareas de hoy cargadas: ${tasks.length}`)
      return tasks
    } catch (error) {
      console.error('Error obteniendo tareas de hoy:', error)
      throw error
    }
  })

  ipcMain.handle('set-active-task', async (_, taskId: number) => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      await prisma.task.updateMany({
        where: { date: today, active: true },
        data: { active: false, status: 'PAUSED' }
      })

      const updated = await prisma.task.update({
        where: { id: taskId },
        data: {
          active: true,
          status: 'IN_PROGRESS'
        }
      })

      return updated
    } catch (error) {
      console.error('Error activando tarea:', error)
      throw error
    }
  })

  ipcMain.handle('pause-task', async (_, taskId: number) => {
    try {
      const updated = await prisma.task.update({
        where: { id: taskId },
        data: {
          active: false,
          status: 'PAUSED'
        }
      })
      return updated
    } catch (error) {
      console.error('Error pausando tarea:', error)
      throw error
    }
  })

  ipcMain.handle('complete-task', async (_, data: { taskId: number; actualMinutes: number }) => {
    try {
      const updated = await prisma.task.update({
        where: { id: data.taskId },
        data: {
          active: false,
          status: 'COMPLETED',
          actualMinutes: data.actualMinutes
        }
      })
      return updated
    } catch (error) {
      console.error('Error completando tarea:', error)
      throw error
    }
  })
}