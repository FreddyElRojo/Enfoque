/*Este componente es el resumen visual del progreso diario del usuario.
Su responsabilidad única y concisa es mostrar dos métricas clave de motivación:

Cantidad de pomodoros completados en la sesión actual.
Horas totales trabajadas hoy (acumuladas de forma parcial cada 30 segundos + completadas al finalizar ciclos).*/

import styles from '../App.module.css'

// Definimos las props que recibe el componente desde App.tsx
// Son valores calculados por hooks: no hay lógica aquí, solo renderizado
type ProgressSummaryProps = {
  completedPomodoros: number   // Cantidad de pomodoros terminados en la sesión actual (viene de useTimerCycle)
  todayWorked: number          // Horas acumuladas hoy (parciales cada 30s + completas al finalizar ciclos, viene de useDailyProgress)
}

// Componente funcional puro: recibe props y renderiza UI simple
// No tiene estado, efectos ni lógica → ideal para rendimiento y mantenibilidad
export const ProgressSummary = ({ completedPomodoros, todayWorked }: ProgressSummaryProps) => {
  return (
    // Contenedor simple sin estilo extra (todo viene de clases CSS)
    <div>
      {/* Muestra pomodoros completados (recompensa inmediata por ciclos terminados) */}
      <p className={styles.pomodoros}>
        Pomodoros completados: {completedPomodoros}
      </p>

      {/* Muestra progreso parcial del día (horas trabajadas hoy) */}
      {/* toFixed(2) para mostrar siempre 2 decimales (ej: 1.25 horas) */}
      
      <p className={styles.dailyProgress}>
        Hoy ya sumaste: {todayWorked.toFixed(2)} horas 🔥
      </p>
    </div>
  )
}