import { useEffect, useState, useCallback } from 'react'
import { useTimer } from 'react-timer-hook'
import styles from './App.module.css'

// Tipo para settings desde DB
type Settings = {
  id: number
  workTime: number
  breakTime: number
  longBreak: number
  createdAt: Date | string
}

function App() {
  const [settings, setSettings] = useState<Settings | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [tempSettings, setTempSettings] = useState<Partial<Settings>>({})
  const [mode, setMode] = useState<'work' | 'shortBreak' | 'longBreak'>('work')
  const [completedPomodoros, setCompletedPomodoros] = useState(0)

  // Carga settings al montar
  useEffect(() => {
    window.api.getSettings()
      .then((data: Settings) => {
        setSettings(data)
        setTempSettings(data)
        console.log('Settings cargados:', data)
      })
      .catch(err => console.error('Error cargando settings:', err))
  }, [])

  // Memoizar getExpiryTimestamp para evitar recreación en cada render
  const getExpiryTimestamp = useCallback(() => {
    const time = new Date()
    let duration = 25 // valor por defecto
    
    if (settings) {
      switch (mode) {
        case 'work':
          duration = settings.workTime
          break
        case 'shortBreak':
          duration = settings.breakTime
          break
        case 'longBreak':
          duration = settings.longBreak
          break
      }
    }
    
    // Usar getTime() para evitar problemas con valores mayores a 60
    time.setTime(time.getTime() + duration * 60 * 1000)
    return time
  }, [settings, mode])

  // Inicializar el timer solo después de cargar los settings
  const {
    totalSeconds,
    seconds,
    minutes,
    isRunning,
    start,
    pause,
    resume,
    restart
  } = useTimer({
    expiryTimestamp: getExpiryTimestamp(),
    onExpire: handleCycleComplete,
    autoStart: false
  })

  // Actualizar el timer cuando cambian los settings o el modo
  useEffect(() => {
    if (settings) {
      restart(getExpiryTimestamp(), false)
    }
  }, [settings, mode, getExpiryTimestamp, restart])

  function handleCycleComplete() {
    if (mode === 'work') {
      const newCount = completedPomodoros + 1
      setCompletedPomodoros(newCount)

      if (newCount % 4 === 0) {
        setMode('longBreak')
      } else {
        setMode('shortBreak')
      }
    } else {
      setMode('work')
    }
  }

  function resetTimer() {
    setMode('work')
    setCompletedPomodoros(0)
    if (settings) {
      restart(getExpiryTimestamp(), false)
    }
  }

  // Calcular horas y minutos para mostrar correctamente más de 60 minutos
  function formatTime() {
    const totalMinutes = Math.floor(totalSeconds / 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const seconds = totalSeconds % 60
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
  }

  const saveSettings = async () => {
    if (!tempSettings.workTime || !tempSettings.breakTime || !tempSettings.longBreak) return

    try {
      await window.api.updateSettings({
        workTime: tempSettings.workTime,
        breakTime: tempSettings.breakTime,
        longBreak: tempSettings.longBreak
      })
      const updated = await window.api.getSettings()
      setSettings(updated)
      setTempSettings(updated)
      setEditMode(false)
      console.log('Settings guardados')
    } catch (err) {
      console.error('Error guardando settings:', err)
    }
  }

  // Mostrar valores actuales
  const workDuration = settings?.workTime || 25
  const shortBreakDuration = settings?.breakTime || 5
  const longBreakDuration = settings?.longBreak || 15

  return (
    <div className={`${styles.container} ${styles[mode]}`}>
      
      
      <h2 className={`${styles.mode} ${mode === 'work' ? styles.workMode : styles.breakMode}`}>
        {mode === 'work' ? 'Trabajo' : mode === 'shortBreak' ? 'Descanso' : 'Largo'}
      </h2>

      <div className={styles.timer}>
        {formatTime()}
      </div>

      <div className={styles.buttons}>
        <button onClick={start} disabled={isRunning} className={styles.button}>
          Iniciar
        </button>
        <button onClick={isRunning ? pause : resume} className={styles.button}>
          {isRunning ? 'Pausar' : 'Reanudar'}
        </button>
        <button onClick={resetTimer} className={styles.button}>
          Reset
        </button>
      </div>

      <p className={styles.pomodoros}>
        Pomodoros: {completedPomodoros}
      </p>

      <div className={styles.configSection}>
        <h3 className={styles.configTitle}>Configuración</h3>
        
        {editMode ? (
          <div>
            <div className={styles.configLabel}>
              <label>Trabajo:</label>
              <input 
                type="number" 
                value={tempSettings.workTime ?? 25}
                onChange={e => setTempSettings({ ...tempSettings, workTime: Number(e.target.value) })}
                min="1"
                className={styles.configInput}
              />
            </div>
            
            <div className={styles.configLabel}>
              <label>Descanso corto:</label>
              <input 
                type="number" 
                value={tempSettings.breakTime ?? 5}
                onChange={e => setTempSettings({ ...tempSettings, breakTime: Number(e.target.value) })}
                min="1"
                className={styles.configInput}
              />
            </div>
            
            <div className={styles.configLabel}>
              <label>Descanso largo:</label>
              <input 
                type="number" 
                value={tempSettings.longBreak ?? 15}
                onChange={e => setTempSettings({ ...tempSettings, longBreak: Number(e.target.value) })}
                min="1"
                className={styles.configInput}
              />
            </div>

            <div className={styles.configButtons}>
              <button onClick={saveSettings} className={`${styles.button} ${styles.saveButton}`}>
                Guardar
              </button>
              <button onClick={() => setEditMode(false)} className={`${styles.button} ${styles.cancelButton}`}>
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p>Trabajo: {workDuration} min</p>
            <p>Descanso corto: {shortBreakDuration} min</p>
            <p>Descanso largo: {longBreakDuration} min</p>
            <button onClick={() => setEditMode(true)} className={styles.button}>
              Editar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App