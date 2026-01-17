/// <reference types="vite/client" />
// src/renderer/src/env.d.ts

interface Window {
    api: {
      getSettings: () => Promise<{
        id: number
        workTime: number
        breakTime: number
        longBreak: number
        createdAt: Date | string  // Date en DB, string en JSON
      }>
      updateSettings: (settings: {
        workTime: number
        breakTime: number
        longBreak: number
      }) => Promise<any>
    }
  }