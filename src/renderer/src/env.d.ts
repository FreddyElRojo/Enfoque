/*Este archivo es el "diccionario de tipos globales" para todo el código del renderer process (React).
Su responsabilidad única y concisa es:

Extender la interfaz global Window para que TypeScript sepa que existe window.api y qué métodos tiene.
Proporcionar tipos precisos para todos los métodos expuestos por el preload (getSettings, updateSettings, logDailyProgress, getDailyLog).
Evitar errores de tipo como "Property 'api' does not exist on type 'Window'" en cualquier componente/hook.*/


// Referencia a tipos de Vite (necesario para que TS reconozca importaciones de assets como imágenes, CSS modules, etc.)
/// <reference types="vite/client" />

// Archivo principal de tipos globales del renderer
// Aquí extendemos la interfaz global Window para que TypeScript sepa que existe window.api
// con los métodos que exponemos desde preload/index.ts
interface Window {
  api: {
    // Método para obtener settings actuales desde DB
    // Retorna Promise con el objeto settings completo (o defaults si no existe)
    // Usado por useSettings.ts para carga inicial
    getSettings: () => Promise<{
      id: number
      workTime: number
      breakTime: number
      longBreak: number
      createdAt: Date | string  // Date en DB, string al serializar por IPC
    }>

    // Método para actualizar settings en DB
    // Recibe objeto parcial con los campos a cambiar
    // Usado por ConfigPanel y saveSettings en App.tsx
    updateSettings: (settings: {
      workTime: number
      breakTime: number
      longBreak: number
    }) => Promise<any>  // Retorna el registro actualizado (o error)

    // Método para registrar progreso parcial del día
    // Suma horas trabajadas (llamado cada 30s desde useDailyProgress)
    // En main: suma a dailyLog.hoursWorked y actualiza goalsMet
    logDailyProgress: (hours: number) => Promise<any>

    // Método para obtener el registro completo del día actual
    // Usado por useDailyProgress para carga inicial de todayWorked
    // Retorna null si no existe registro del día
    getDailyLog: (date: Date) => Promise<{
      id: number
      date: Date
      hoursWorked: number
      goalsMet: boolean
      streak: number
      notes?: string | null  // Campo opcional para notas futuras
    } | null>

    // Obtiene la racha actual (días consecutivos con goalsMet = true)
// Retorna un objeto con la racha numérica y un mensaje motivador win-win
// (ej: "¡5 días seguidos! Sos una máquina de constancia 🔥")
    getCurrentStreak: () => Promise<{
      streak: number
      message: string
    }>
  
  // Métodos para la feature de tareas (minimalista)
// Crea una nueva tarea para el día actual
createTask: (task: { description: string; estimatedMinutes: number }) => Promise<{
  id: number
  description: string
  estimatedMinutes: number
  actualMinutes: number | null
  status: string  // 'NOT_STARTED', 'IN_PROGRESS', etc.
  active: boolean
  date: string    // ISO date
  createdAt: string
  updatedAt: string
}>

// Obtiene todas las tareas del día actual
getTasksToday: () => Promise<Array<{
  id: number
  description: string
  estimatedMinutes: number
  actualMinutes: number | null
  status: string
  active: boolean
  date: string
  createdAt: string
  updatedAt: string
}>>

// Activa una tarea (desactiva automáticamente las demás activas del día)
setActiveTask: (taskId: number) => Promise<{
  id: number
  description: string
  estimatedMinutes: number
  actualMinutes: number | null
  status: string
  active: boolean
  date: string
  createdAt: string
  updatedAt: string
}>

// Pausa la tarea activa (cambia status a PAUSED y active a false)
pauseTask: (taskId: number) => Promise<{
  id: number
  description: string
  estimatedMinutes: number
  actualMinutes: number | null
  status: string
  active: boolean
  date: string
  createdAt: string
  updatedAt: string
}>

// Completa una tarea (registra tiempo real, status COMPLETED, active false)
completeTask: (data: { taskId: number; actualMinutes: number }) => Promise<{
  id: number
  description: string
  estimatedMinutes: number
  actualMinutes: number
  status: string
  active: boolean
  date: string
  createdAt: string
  updatedAt: string
}>
  
  }
}