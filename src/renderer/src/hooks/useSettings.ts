/*Este hook es el responsable exclusivo de gestionar la carga y actualización de los settings del usuario (tiempos de trabajo, descanso corto y largo).
Su responsabilidad única y concisa es:

Cargar los settings desde la base de datos al montar el componente.
Crear valores default si no existen.
Proporcionar una función updateSettings para guardar cambios en la DB vía IPC.
Mantener un estado de loading para indicar si la carga inicial está en curso.*/

// Importamos lo básico para crear hooks con estado y efectos
import { useEffect, useState } from 'react'

// Definimos el tipo Settings (consistente en toda la app)
// Representa el registro único en la tabla UserSettings de la DB
type Settings = {
  id: number
  workTime: number
  breakTime: number
  longBreak: number
  createdAt: Date | string
}

// Hook principal: gestiona la carga y actualización de settings
// Retorna el estado actual, función para actualizar y loading
export const useSettings = () => {
  // Estado principal: contiene los settings actuales o null si aún no cargaron
  const [settings, setSettings] = useState<Settings | null>(null)

  // Estado de carga: true al inicio, false cuando termina la carga inicial
  // Útil para mostrar spinners o placeholders en UI (aunque en este caso no se usa aún)
  const [loading, setLoading] = useState(true)

  // Efecto que carga los settings al montar el componente (una sola vez)
  // Es el punto de entrada para sincronizar la UI con la DB
  useEffect(() => {
    // Función asincrónica interna para no bloquear el efecto
    const loadSettings = async () => {
      try {
        // Llamamos al método expuesto por preload (IPC → main → Prisma)
        const data = await window.api.getSettings()
        setSettings(data)
        console.log('Settings cargados:', data)
      } catch (err) {
        // Log silencioso (no rompemos la app, usamos defaults locales en otros hooks)
        console.error('Error cargando settings:', err)
      } finally {
        // Siempre marcamos loading como false (éxito o fallo)
        setLoading(false)
      }
    }

    // Ejecutamos la carga
    loadSettings()
  }, []) // Array vacío = solo una vez al montar

  // Función para actualizar settings en la DB
  // Recibe valores parciales (Partial<Settings>) → solo actualiza lo que se envía
  // Retorna los settings actualizados para refrescar estado
  const updateSettings = async (newSettings: Partial<Settings>) => {
    try {
      // Llamamos al IPC expuesto por preload (main actualiza DB con Prisma)
      await window.api.updateSettings({
        workTime: newSettings.workTime!,     // ! fuerza non-null (validado antes)
        breakTime: newSettings.breakTime!,
        longBreak: newSettings.longBreak!
      })

      // Refrescamos el estado con los valores nuevos de DB
      const updated = await window.api.getSettings()
      setSettings(updated)
      return updated // Por si quien llama quiere usar los valores frescos
    } catch (err) {
      console.error('Error actualizando settings:', err)
      throw err // Propaga error para manejo en UI si es necesario
    }
  }

  // Retornamos lo que necesita App.tsx y otros componentes
  return { settings, updateSettings, loading }
}