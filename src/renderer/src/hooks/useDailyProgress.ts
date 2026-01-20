/*Este hook es el encargado de gestionar el progreso parcial y acumulado del día actual.
Su responsabilidad única y concisa es:

Cargar el progreso inicial del día desde la DB (si existe).
Sumar progreso parcial cada 30 segundos mientras el usuario está en modo trabajo y el timer está corriendo.
Actualizar el estado local (todayWorked) para reflejarlo en la UI en tiempo real.
Guardar cada suma parcial en la DB vía IPC (para que no se pierda si se cierra la app).*/


import { useEffect, useState, useRef } from 'react'

type UseDailyProgressProps = {
  isRunning: boolean
  mode: 'work' | 'shortBreak' | 'longBreak'
}

export const useDailyProgress = ({ isRunning, mode }: UseDailyProgressProps) => {
  const [todayWorked, setTodayWorked] = useState(0)
  const lastUpdateTime = useRef(Date.now()) // Timestamp del último update
  const workStartTime = useRef<number | null>(null) // Inicio del ciclo work actual

  // Carga inicial
  useEffect(() => {
    const loadTodayWorked = async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const log = await window.api.getDailyLog(today)
      if (log) {
        setTodayWorked(log.hoursWorked)
      }
    }
    loadTodayWorked()
  }, [])

  // Detecta inicio de modo work
  useEffect(() => {
    if (mode === 'work' && isRunning && workStartTime.current === null) {
      workStartTime.current = Date.now()
      lastUpdateTime.current = Date.now()
    } else if (mode !== 'work' || !isRunning) {
      workStartTime.current = null // Resetea al salir de work o pausar
    }
  }, [mode, isRunning])

  // Suma tiempo real cada 5 segundos (más preciso, menos carga)
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && mode === 'work') {
      interval = setInterval(() => {
        const now = Date.now()
        const elapsedMs = now - lastUpdateTime.current
        const elapsedHours = elapsedMs / (1000 * 60 * 60) // ms → horas

        setTodayWorked(prev => prev + elapsedHours)
        window.api.logDailyProgress(elapsedHours)
          .then(() => console.log('Progreso parcial real guardado:', elapsedHours))
          .catch(err => console.error('Error guardando parcial:', err))

        lastUpdateTime.current = now
      }, 5000) // 5 segundos (muy preciso, pérdida máxima ~5s)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, mode])

  return { todayWorked }
}