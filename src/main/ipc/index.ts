
// Archivo que agrupa y exporta todos los handlers IPC
// Facilita que main/index.ts registre todo con una sola llamada

import { registerSettingsHandlers } from './settings'
import { registerDailyLogHandlers } from './daily-log'
import { registerStreakHandlers } from './streak'
import { registerTaskHandlers } from './tasks'

export function registerIpcHandlers() {
  registerSettingsHandlers()
  registerDailyLogHandlers()
  registerStreakHandlers()
  registerTaskHandlers()
  
}