import { useEffect, useState } from 'react'

// Tipo de datos que devuelve la racha (streak + mensaje motivador)
type StreakData = {
  streak: number
  message: string
}

export const useStreak = () => {
  // Estado inicial: racha 0 + mensaje neutro (para evitar flash)
  const [streakData, setStreakData] = useState<StreakData>({
    streak: 0,
    message: 'Cargando racha...'
  })

  // Último valor conocido (para fallback en caso de error)
  const [lastKnown, setLastKnown] = useState<StreakData>({
    streak: 0,
    message: '¡Seguimos sumando!'
  })

  useEffect(() => {
    const loadStreak = async () => {
      try {
        const data = await window.api.getCurrentStreak()
        setStreakData(data)
        setLastKnown(data) // Actualiza el último conocido con éxito
      } catch (err) {
        console.error('Error cargando racha:', err)
        // Fallback: no reseteamos a 0, mantenemos último valor conocido
        // + mensaje suave para no asustar al usuario
        setStreakData({
          ...lastKnown,
          message: '¡Seguimos sumando! (error temporal en racha)'
        })
      }
    }

    loadStreak()

    // Recarga cada 5 minutos (puedes bajar a 1 min si querés más frecuente)
    const interval = setInterval(loadStreak, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return streakData
}