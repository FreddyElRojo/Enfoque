/*Este hook es el núcleo de la lógica del temporizador Pomodoro.
Su responsabilidad única y concisa es:

Manejar el estado del ciclo (modo actual: trabajo / descanso corto / largo).
Gestionar el countdown (usando react-timer-hook).
Controlar transiciones automáticas entre modos (work → short/long break → work).
Contar pomodoros completados en la sesión.
Reiniciar el timer cuando cambian las duraciones (ej: al guardar settings).

Funcionalidad principal:

Inicializa en modo 'work' con duración configurable.
Al terminar un ciclo (onExpire): decide el siguiente modo, suma pomodoro si era trabajo.
Reinicia automáticamente el timer al cambiar duraciones (solución al bug de settings).
Siempre reinicia en pausa (autoStart: false) → usuario decide cuándo empezar.
Exporta todo lo necesario para UI y control (totalSeconds para formato >60 min).*/


// Importamos el hook de timer (react-timer-hook) que maneja countdown, estados y eventos
import { useTimer } from 'react-timer-hook'

// Importamos hooks básicos de React para estado y memoización
import { useState, useCallback, useEffect } from 'react'

// Definimos las props que recibe el hook desde App.tsx
// Son las duraciones actuales (de DB o defaults) → cambian cuando se actualizan settings
type TimerCycleProps = {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
}

// Hook principal: maneja toda la lógica del ciclo Pomodoro
// Retorna todo lo necesario para UI y control
export const useTimerCycle = ({ workDuration, shortBreakDuration, longBreakDuration }: TimerCycleProps) => {
  // Estado del modo actual del ciclo (empieza en trabajo)
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work')
  
  // Contador de pomodoros completados en la sesión actual (reinicia con resetTimer)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)

  // Calcula el tiempo de expiración (expiryTimestamp) según modo y duraciones actuales
  // Memoizado para evitar recreación innecesaria en cada render
  const getExpiryTimestamp = useCallback(() => {
    const time = new Date()
    const duration = mode === 'work' ? workDuration : (mode === 'shortBreak' ? shortBreakDuration : longBreakDuration)
    time.setSeconds(time.getSeconds() + duration * 60)
    return time
  }, [mode, workDuration, shortBreakDuration, longBreakDuration])

  // Hook principal del timer: maneja el countdown real
  // onExpire: decide siguiente modo y reinicia timer
  const {
    totalSeconds,   // Total de segundos restantes (clave para formato >60 min)
    seconds,        // Segundos actuales del minuto
    minutes,        // Minutos actuales de la hora
    isRunning,      // Si el timer está activo
    start,          // Inicia desde pausa
    pause,          // Pausa el countdown
    resume,         // Reanuda desde pausa
    restart         // Reinicia con nuevo expiryTimestamp
  } = useTimer({
    expiryTimestamp: getExpiryTimestamp(),
    onExpire: () => {
      // Lógica de fin de ciclo
      if (mode === 'work') {
        // Terminó trabajo → suma pomodoro completado
        const newCount = completedPomodoros + 1
        setCompletedPomodoros(newCount)

        // Decide si es descanso corto o largo (cada 4 pomodoros)
        if (newCount % 4 === 0) {
          setMode('longBreak')
        } else {
          setMode('shortBreak')
        }
      } else {
        // Terminó cualquier descanso → vuelve a trabajo
        setMode('work')
      }

      // Reinicia el timer con el nuevo modo (siempre en pausa)
      restart(getExpiryTimestamp(), false)
    },
    autoStart: false  // Nunca inicia automáticamente al montar o reiniciar
  })

  // Reinicia el timer automáticamente cuando cambian duraciones o modo
  // Esto soluciona el bug de que al guardar nuevos settings el timer no se actualiza
  // Reinicia el timer cuando cambian las duraciones (de settings)
useEffect(() => {
  console.log('Duraciones cambiadas (work/short/long):', {
    work: workDuration,
    short: shortBreakDuration,
    long: longBreakDuration
  })

  // Fuerza reinicio completo con nuevos valores
  restart(getExpiryTimestamp(), false) // false = queda en pausa

  // Opcional: si querés que siga corriendo, usa true en vez de false
  // restart(getExpiryTimestamp(), isRunning) // mantiene estado running
}, [workDuration, shortBreakDuration, longBreakDuration, restart, getExpiryTimestamp])

  // Función para resetear todo: vuelve a modo trabajo, reinicia contador y timer (en pausa)
  const resetTimer = () => {
    setMode('work')
    setCompletedPomodoros(0)
    restart(getExpiryTimestamp(), false)
  }

  // Retornamos todo lo necesario para App.tsx y TimerDisplay
  return {
    mode,                    // Modo actual (para color y texto)
    totalSeconds,            // Para formato de tiempo completo (>60 min)
    seconds,
    minutes,
    isRunning,               // Para deshabilitar botones y activar intervalo
    start,
    pause,
    resume,
    resetTimer,
    completedPomodoros       // Para mostrar en ProgressSummary
  }
}