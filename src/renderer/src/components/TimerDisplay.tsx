/*Este componente es la parte visual central del Pomodoro: muestra el tiempo restante, el modo actual y los botones de control.
Su responsabilidad única y concisa es:

Renderizar el countdown con formato correcto (incluyendo horas cuando >60 min).
Mostrar el modo actual (Trabajo / Descanso / Largo) con color diferenciado.
Proporcionar botones de interacción: Iniciar, Pausar/Reanudar, Reset.

Funcionalidad principal:

Recibe el estado del timer (totalSeconds, seconds, minutes, mode, isRunning) y funciones de control (start, pause, resume, resetTimer) como props.
Formatea el tiempo de forma inteligente (muestra horas solo si es necesario).
No tiene estado ni efectos secundarios → es un componente puro y controlado (todo lo maneja el hook useTimerCycle).*/

import styles from '../App.module.css'

// Definimos las props que recibe el componente desde App.tsx
// Todas vienen del hook useTimerCycle (estado del timer y funciones de control)
type TimerDisplayProps = {
  totalSeconds: number                     // Total de segundos restantes (clave para manejar tiempos >60 min)
  seconds: number                          // Segundos actuales del minuto
  minutes: number                          // Minutos actuales de la hora
  mode: 'work' | 'shortBreak' | 'longBreak' // Modo actual del ciclo (determina texto y color)
  isRunning: boolean                       // Indica si el timer está corriendo (deshabilita botón Iniciar)
  start: () => void                        // Inicia el timer desde pausa
  pause: () => void                        // Pausa el timer
  resume: () => void                       // Reanuda el timer desde pausa
  resetTimer: () => void                   // Reinicia todo el ciclo (vuelve a modo trabajo)
}

export const TimerDisplay = ({
  totalSeconds,
  seconds,
  minutes,
  mode,
  isRunning,
  start,
  pause,
  resume,
  resetTimer
}: TimerDisplayProps) => {
  // Función interna para formatear el tiempo de forma correcta
  // Maneja tiempos mayores a 60 minutos mostrando horas:minutos:segundos
  // Usa totalSeconds (del hook useTimer) para precisión total
  const formatTime = () => {
    const hours = Math.floor(totalSeconds / 3600)                  // Horas completas
    const remainingMinutes = Math.floor((totalSeconds % 3600) / 60) // Minutos restantes
    const remainingSeconds = totalSeconds % 60                     // Segundos restantes

    // Si hay horas, muestra formato completo HH:MM:SS
    // Si no, solo MM:SS (evita mostrar 00: al inicio)
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    } else {
      return `${remainingMinutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }

  return (
    <>
      

      {/* Contenedor del countdown */}
      {/* Clase .timer para tamaño grande, fuente bold y opacidad sutil */}
      <div className={styles.timerPanel}>
  <div className={styles.timerScreen}>

    <div className={styles.timerTopRow}>
      <span className={`${styles.timerMode} ${styles[mode]}`}>
        {mode === 'work' ? 'FOCUS' : mode === 'shortBreak' ? 'BREAK' : 'LONG BREAK'}
      </span>
    </div>

    <span className={styles.timer}>{formatTime()}</span>

  </div>
</div>


      {/* Contenedor de botones de control */}
      {/* Clase .buttons para alineación horizontal y spacing */}
      <div className={styles.timerControlButtons}>
        {/* Botón Iniciar: solo activo si no está corriendo */}
        <button onClick={start} disabled={isRunning} className={styles.timerControlButton}>
          Iniciar
        </button>

        {/* Botón Pausar/Reanudar: cambia texto según estado */}
        <button onClick={isRunning ? pause : resume} className={styles.timerControlButton}>
          {isRunning ? 'Pausar' : 'Reanudar'}
        </button>

        {/* Botón Reset: reinicia todo el ciclo (vuelve a modo trabajo) */}
        <button onClick={resetTimer} className={styles.timerControlButton}>
          Reset
        </button>
      </div>
    </>
  )
}