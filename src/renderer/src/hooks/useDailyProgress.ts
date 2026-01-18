/*Este hook es el encargado de gestionar el progreso parcial y acumulado del día actual.
Su responsabilidad única y concisa es:

Cargar el progreso inicial del día desde la DB (si existe).
Sumar progreso parcial cada 30 segundos mientras el usuario está en modo trabajo y el timer está corriendo.
Actualizar el estado local (todayWorked) para reflejarlo en la UI en tiempo real.
Guardar cada suma parcial en la DB vía IPC (para que no se pierda si se cierra la app).*/


import { useEffect, useState } from 'react'

// Definimos las props que debe recibir el hook desde App.tsx
// Necesitamos saber si el timer está corriendo y en qué modo estamos
type UseDailyProgressProps = {
  isRunning: boolean                        // Indica si el timer está activo (del hook useTimerCycle)
  mode: 'work' | 'shortBreak' | 'longBreak' // Modo actual (solo suma en 'work')
}

// Hook principal: maneja el progreso parcial del día
// Retorna solo { todayWorked } para que App.tsx lo pase a ProgressSummary
export const useDailyProgress = ({ isRunning, mode }: UseDailyProgressProps) => {
  // Estado local del hook: acumula horas trabajadas hoy (parcial + completas)
  // Se inicializa en 0 y se actualiza cada 30s o al cargar
  const [todayWorked, setTodayWorked] = useState(0)

  // Carga inicial del progreso del día (se ejecuta solo una vez al montar)
  // Esto asegura que si cerraste la app a mitad de pomodoro, el progreso parcial anterior no se pierde
  useEffect(() => {
    const loadTodayWorked = async () => {
      // Normalizamos la fecha a inicio del día (sin hora) para buscar en DB
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Llamamos al IPC expuesto en preload (que va al main y consulta Prisma)
      const log = await window.api.getDailyLog(today)

      if (log) {
        // Si ya existe registro del día, cargamos el valor acumulado
        setTodayWorked(log.hoursWorked)
        console.log('Progreso parcial hoy cargado:', log.hoursWorked)
      } else {
        // Si no existe, dejamos en 0 (el intervalo empezará a sumar)
        console.log('No hay registro de hoy todavía')
      }
    }

    // Ejecutamos la carga asincrónica
    loadTodayWorked()
  }, []) // Array vacío = se ejecuta solo una vez al montar el componente

  // Intervalo de 30 segundos para sumar progreso parcial (solo en modo trabajo)
  // Esto minimiza la pérdida máxima a 30 segundos si se cierra la app inesperadamente
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null // Variable para limpiar el intervalo

    // Solo activamos el intervalo si el timer está corriendo y estamos en modo trabajo
    // Esto asegura que solo contemos tiempo productivo (no breaks ni pausas)
    if (isRunning && mode === 'work') {
      interval = setInterval(() => {
        const minutesSinceLast = 0.5 // 30 segundos = 0.5 minutos
        const hoursToAdd = minutesSinceLast / 60 // Convertimos a horas decimales (~0.0083)

        // Actualizamos el estado local (para reflejarlo en UI inmediatamente)
        setTodayWorked(prev => prev + hoursToAdd)

        // Guardamos en DB vía IPC (para persistencia si se cierra la app)
        window.api.logDailyProgress(hoursToAdd)
          .then(() => console.log('Progreso parcial guardado:', hoursToAdd))
          .catch(err => console.error('Error guardando parcial:', err))
      }, 30000) // 30 segundos (fijo, no configurable para consistencia)
    }

    // Cleanup: limpiamos el intervalo al pausar, cambiar modo o desmontar
    // Esto evita memory leaks e intervalos huérfanos
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, mode]) // Dependencias: se re-ejecuta si cambia isRunning o mode

  // Retornamos solo lo que necesita App.tsx (el valor acumulado)
  // ProgressSummary lo usa para mostrar "Hoy ya sumaste: X horas"
  return { todayWorked }
}