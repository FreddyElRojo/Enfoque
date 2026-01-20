import styles from '../App.module.css'

// Props que recibe el componente desde App.tsx
// Son valores que vienen del hook useStreak
type StreakDisplayProps = {
  streak: number      // Cantidad de días consecutivos con goal cumplido
  message: string     // Mensaje motivador positivo (win-win)
}

export const StreakDisplay = ({ streak, message }: StreakDisplayProps) => {
  // Función para decidir el estilo del badge según la longitud de la racha
  // Más larga = más impacto visual (pero siempre sutil y positivo)
  const getStreakStyle = () => {
    if (streak >= 7) return styles.streakHigh     // Ej: dorado o fuerte
    if (streak >= 3) return styles.streakMedium   // Ej: naranja cálido
    return styles.streakLow                       // Ej: gris suave o verde claro
  }

  return (
    // Contenedor sutil: pequeño, semitransparente, arriba o al lado de ProgressSummary
    <div className={`${styles.streakContainer} ${getStreakStyle()}`}>
      {/* Icono o emoji de racha (fuego o cadena) */}
      <span className={styles.streakIcon}>🔥</span>

      {/* Número de la racha (grande si es alta) */}
      <span className={styles.streakNumber}>
        {streak} {streak === 1 ? 'día' : 'días'}
      </span>

      {/* Mensaje motivador (siempre positivo, nunca "rota") */}
      <span className={styles.streakMessage}>
        {message}
      </span>
    </div>
  )
}