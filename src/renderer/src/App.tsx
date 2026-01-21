/*Este archivo es el orquestador principal y punto de entrada del renderer process (React).
Su responsabilidad única y concisa es:

Componer la aplicación completa uniendo todos los hooks y componentes.
Mantener los estados de alto nivel que conectan todo (editMode, tempSettings).
Coordinar la comunicación entre hooks (useSettings, useTimerCycle, useDailyProgress) y componentes visuales (TimerDisplay, ProgressSummary, ConfigPanel).
No contiene lógica de negocio pesada → delega todo a hooks y componentes.*/

// Importamos los hooks principales (cada uno maneja una responsabilidad específica)
import { useEffect, useState } from 'react'
import { useSettings } from './hooks/useSettings'              // Conexión con DB (carga/update settings)
import { useTimerCycle } from './hooks/useTimerCycle'          // Núcleo del temporizador Pomodoro
import { useDailyProgress } from './hooks/useDailyProgress'    // Progreso parcial diario (intervalo 30s)
import { useStreak } from './hooks/useStreak'                  // rachas
// Importamos los componentes visuales (UI pura, reciben props y renderizan)
import { TimerDisplay } from './components/TimerDisplay'       // Countdown + botones de control
import { ProgressSummary } from './components/ProgressSummary' // Pomodoros y horas hoy
import { ConfigPanel } from './components/ConfigPanel'         // Vista/edición de settings
import { StreakDisplay } from './components/StreakDisplay'     // vista de rachas
// Estilos globales del módulo CSS (vidrio esmerilado, colores por modo, botones finos)
import styles from './App.module.css'

// Tipo Settings (consistente en toda la app, representa el registro único en UserSettings)
type Settings = {
  id: number
  workTime: number
  breakTime: number
  longBreak: number
  createdAt: Date | string
}

// Componente raíz del renderer: orquesta toda la app
function App() {
  // Hook principal de conexión con DB: carga settings y provee función para actualizarlos
  // Se conecta vía IPC a main → Prisma → DB
  const { settings, updateSettings } = useSettings()

  // Estado local para manejar modo edición y valores temporales del formulario
  // Se usa como puente entre ConfigPanel y la función updateSettings
  const [editMode, setEditMode] = useState(false)
  const [tempSettings, setTempSettings] = useState<Partial<Settings>>({})

  // Hook del temporizador: maneja modos, countdown, ciclos y control
  // Recibe duraciones de settings → se actualiza automáticamente cuando cambian
  const {
    mode,                    // Modo actual (trabajo/descanso) → afecta fondo y texto
    totalSeconds,            // Total segundos restantes → para formato >60 min
    seconds, minutes,        // Partes del tiempo actual
    isRunning,               // Estado del timer → alimenta useDailyProgress
    start, pause, resume,    // Funciones de control → pasan a TimerDisplay
    resetTimer,              // Reinicio completo → pasa a TimerDisplay
    completedPomodoros       // Contador de ciclos terminados → pasa a ProgressSummary
  } = useTimerCycle({
    workDuration: settings?.workTime || 25,         // Duración de trabajo (de DB o default)
    shortBreakDuration: settings?.breakTime || 5,   // Descanso corto
    longBreakDuration: settings?.longBreak || 15    // Descanso largo
  })

  // Hook de progreso parcial: suma horas cada 30s en modo trabajo
  // Depende de isRunning y mode (del useTimerCycle) → solo suma en trabajo activo
  const { todayWorked } = useDailyProgress({ isRunning, mode })

  // Inicializa tempSettings con valores actuales cuando settings se cargan de DB
  // Esto permite que el formulario de edición arranque con los valores correctos
  useEffect(() => {
    if (settings) {
      setTempSettings(settings)
    }
  }, [settings])

  // Función para guardar cambios en DB (llama a updateSettings del hook)
  // Se pasa como prop a ConfigPanel → se ejecuta al presionar Guardar
  const saveSettings = async () => {
    if (!tempSettings.workTime || !tempSettings.breakTime || !tempSettings.longBreak) return

    try {
      await updateSettings({
        workTime: tempSettings.workTime,
        breakTime: tempSettings.breakTime,
        longBreak: tempSettings.longBreak
      })
      setEditMode(false)
      console.log('Settings guardados y timer actualizado')
    } catch (err) {
      console.error('Error guardando settings:', err)
    }
  }
// hook de rachas
  const { streak, message } = useStreak();

  // Renderizado principal: composición de componentes
  return (
    
    // Contenedor raíz con clase dinámica según modo (fondo cambia por trabajo/descanso)
    <div className={`${styles.container} ${styles[mode]}`}>
      {/* Título principal (fijo) */}
      <h1 className={styles.title}>Enfoque</h1>


      {/* Componente del temporizador: recibe todo el estado y control del hook */}
      <TimerDisplay
        totalSeconds={totalSeconds}
        seconds={seconds}
        minutes={minutes}
        mode={mode}
        isRunning={isRunning}
        start={start}
        pause={pause}
        resume={resume}
        resetTimer={resetTimer}
      />

      {/* Resumen de progreso: recibe contadores del hook y progreso parcial */}
      <ProgressSummary completedPomodoros={completedPomodoros} todayWorked={todayWorked} />
      <StreakDisplay streak={streak} message={message} />
      {/* Panel de configuración: recibe estado de edición y callbacks */}
      <ConfigPanel
        editMode={editMode}
        tempSettings={tempSettings}
        setTempSettings={setTempSettings}
        saveSettings={saveSettings}
        setEditMode={setEditMode}
        settings={settings}
      />
    </div>
  )
}

export default App