import { create } from 'zustand'
 

type TimerState = {
  mode: 'work' | 'shortBreak' | 'longBreak'
  secondsLeft: number
  isRunning: boolean
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  cycleCount: number

  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  tick: () => void
  switchMode: (newMode?: 'work' | 'shortBreak' | 'longBreak') => void
  updateDurations: (
    work: number,
    shortBreak: number,
    longBreak: number
  ) => void
}

const useTimerStore = create<TimerState>((set, get) => ({
  mode: 'work',
  secondsLeft: 2700,
  isRunning: false,
  workDuration: 2700,
  shortBreakDuration: 300,
  longBreakDuration: 900,
  cycleCount: 0,

  startTimer: () => {
    if (!get().isRunning) {
      set({ isRunning: true })
    }
  },

  pauseTimer: () => {
    if (get().isRunning) {
      set({ isRunning: false })
    }
  },

  resetTimer: () => {
    const { mode, workDuration, shortBreakDuration, longBreakDuration } = get()
    const durationMap = {
      work: workDuration,
      shortBreak: shortBreakDuration,
      longBreak: longBreakDuration
    }
    set({ secondsLeft: durationMap[mode], isRunning: false })
  },

  tick: () => {
    const state = get()
    
    // Si no está corriendo, no hacemos nada
    if (!state.isRunning) return
    
    // Si todavía hay tiempo, restamos 1 segundo
    if (state.secondsLeft > 0) {
      set({ secondsLeft: state.secondsLeft - 1 })
      return
    }
    
    // Si llegamos a 0 segundos, cambiamos de modo
    // Llamamos a switchMode() SIN parámetros para que decida automáticamente
    const { switchMode } = get()
    switchMode()
  },

  switchMode: () => {
    const state = get()
    
    if (state.mode === 'work') {
      const nextCycleCount = state.cycleCount + 1
      const isFourthWork = (nextCycleCount % 4 === 0)
      
      set({
        mode: isFourthWork ? 'longBreak' : 'shortBreak',
        secondsLeft: isFourthWork ? state.longBreakDuration : state.shortBreakDuration,
        cycleCount: nextCycleCount,
        isRunning: false
      })
    } else {
      const justFinishedLongBreak = (state.mode === 'longBreak')
      
      set({
        mode: 'work',
        secondsLeft: state.workDuration,
        isRunning: false,
        cycleCount: justFinishedLongBreak ? 0 : state.cycleCount
      })
    }
  },
  updateDurations: (work, shortBreak, longBreak)=>{
    
set({
  workDuration: work, 
  shortBreakDuration:shortBreak,
  longBreakDuration:longBreak
})
  }
}))

export default useTimerStore