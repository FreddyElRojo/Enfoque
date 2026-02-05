import { useEffect, useState } from 'react'
import useTimerStore from '../store/timerStore'

type Settings = {
  id: number
  workTime: number      // en MINUTOS en la DB
  breakTime: number     // en MINUTOS
  longBreak: number     // en MINUTOS
  createdAt: Date | string
}

export const useSettings = () => {
  const updateDurations = useTimerStore((state) => state.updateDurations)

  const [settings, setSettings] = useState<Settings | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await window.api.getSettings() // ← vienen en MINUTOS
        setSettings(data)

        // 🔥 Convertimos a SEGUNDOS solo para el timer
        updateDurations(
          data.workTime * 60,
          data.breakTime * 60,
          data.longBreak * 60
        )

        console.log('Settings cargados:', data)
      } catch (err) {
        console.error('Error cargando settings:', err)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      // 🚫 NO convertimos a segundos acá
      // Guardamos en la DB exactamente lo que el usuario ve: MINUTOS
      await window.api.updateSettings({
        workTime: newSettings.workTime!,
        breakTime: newSettings.breakTime!,
        longBreak: newSettings.longBreak!
      })

      const updated = await window.api.getSettings() // ← siguen siendo MINUTOS
      setSettings(updated)

      // 🔥 Acá sí convertimos a SEGUNDOS para el timer
      updateDurations(
        updated.workTime * 60,
        updated.breakTime * 60,
        updated.longBreak * 60
      )

      return updated
    } catch (err) {
      console.error('Error actualizando settings:', err)
      throw err
    }
  }

  return { settings, updateSettings, loading }
}
