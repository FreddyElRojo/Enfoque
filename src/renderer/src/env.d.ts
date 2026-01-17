/// <reference types="vite/client" />
// src/renderer/src/env.d.ts

interface Window {
  api: {
    getSettings: () => Promise<{
      id: number
      workTime: number
      breakTime: number
      longBreak: number
      createdAt: Date | string
    }>

    updateSettings: (settings: {
      workTime: number
      breakTime: number
      longBreak: number
    }) => Promise<any>

    logDailyProgress: (hours: number) => Promise<any>

    // ¡Aquí agregamos getDailyLog!
    getDailyLog: (date: Date) => Promise<{
      id: number
      date: Date
      hoursWorked: number
      goalsMet: boolean
      streak: number
      notes?: string | null
    } | null>
  }
}