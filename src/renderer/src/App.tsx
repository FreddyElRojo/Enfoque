import { Fragment, useEffect, useState } from 'react'
import { useSettings } from './hooks/useSettings'
import { useDailyProgress } from './hooks/useDailyProgress'
import { useStreak } from './hooks/useStreak'
import useTimerStore from './store/timerStore'
import { TimerDisplay } from './components/TimerDisplay'
import { ProgressSummary } from './components/ProgressSummary'
import { ConfigPanel } from './components/ConfigPanel'
import { StreakDisplay } from './components/StreakDisplay'
import { BackgroundLayer } from './components/BackgroundLayer'

import styles from './App.module.css'

type Settings = {
  id: number
  workTime: number
  breakTime: number
  longBreak: number
  createdAt: Date | string
}

function App() {
  const { settings, updateSettings } = useSettings()

  const [editMode, setEditMode] = useState(false)
  const [tempSettings, setTempSettings] = useState<Partial<Settings>>({})

 
  const mode = useTimerStore((state) => state.mode)
  const isRunning = useTimerStore((state) => state.isRunning)
  const secondsLeft = useTimerStore((state)=> state.secondsLeft)
  const minutes = Math.trunc(secondsLeft/60);
  const seconds = secondsLeft % 60;
  const start = useTimerStore((state) => state.startTimer);
  const pause = useTimerStore((state) => state.pauseTimer);
  const reset = useTimerStore((state) => state.resetTimer);
  const tick = useTimerStore((state) => state.tick);
  // Hook de progreso diario (por ahora queda, luego lo conectamos al store)
  const { todayWorked } = useDailyProgress({ isRunning, mode })

  useEffect(() => {
    if(!isRunning)return
  
    const interval = setInterval(()=> {
      tick()
    }, 1000)

    return ()=> clearInterval(interval)
  }, [isRunning, tick])

  useEffect(() => {
    if (settings) {
      setTempSettings(settings)
    }
  }, [settings])

  const saveSettings = async () => {
    if (!tempSettings.workTime || !tempSettings.breakTime || !tempSettings.longBreak) return

    try {
      await updateSettings({
        workTime: tempSettings.workTime,
        breakTime: tempSettings.breakTime,
        longBreak: tempSettings.longBreak
      })
      setEditMode(false)
      console.log('Settings guardados')
    } catch (err) {
      console.error('Error guardando settings:', err)
    }
  }

  const { streak, message } = useStreak()

  return (
    <>
      <BackgroundLayer />

      <div className={`${styles.container} ${styles[mode]}`}>
      <div className={styles.titleWrapper}>
          <h1 className={styles.title}>Enfoque</h1>
        </div>

        
        <TimerDisplay
          totalSeconds={secondsLeft}
          seconds={seconds}
          minutes={minutes}
          mode={mode}
          isRunning={isRunning}
          start={start}
          pause={pause}
          resetTimer={reset}
        />
         

        <ProgressSummary completedPomodoros={0} todayWorked={todayWorked} />

        <StreakDisplay streak={streak} message={message} />

        <ConfigPanel
          editMode={editMode}
          tempSettings={tempSettings}
          setTempSettings={setTempSettings}
          saveSettings={saveSettings}
          setEditMode={setEditMode}
          settings={settings}
        />
      </div>
    </>
  )
}

export default App
