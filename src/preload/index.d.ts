/*Este archivo es un "puente de tipos" entre el preload y el renderer.
Su único propósito es decirle a TypeScript:
"Cuando estés en el código del renderer (React), vas a encontrar en window un objeto llamado electron con estos tipos exactos".
Es un archivo muy pequeño y de bajo nivel, pero crítico para evitar errores de tipo como "Property 'electron' does not exist on type 'Window'".
No contiene lógica ejecutable (no hay código que corra), solo tipos.
No expone nada real (la exposición real de window.electron y window.api ocurre en preload/index.ts con contextBridge).*/

// Importamos el tipo oficial de ElectronAPI que provee @electron-toolkit/preload
// Este tipo ya incluye métodos como ipcRenderer, webFrame, etc.
import { ElectronAPI } from '@electron-toolkit/preload'

// Extendemos la interfaz global Window para que TypeScript sepa que existe
// window.electron con los tipos correctos del toolkit.
// Esto evita errores como "Property 'electron' does not exist on type 'Window'"
declare global {
  interface Window {
    // Objeto oficial del toolkit, expuesto en preload con contextBridge
    // Contiene métodos seguros como ipcRenderer, shell, etc.
    electron: ElectronAPI

    // NO declaramos window.api aquí (eso va en src/renderer/src/env.d.ts)
    // para evitar conflictos de tipos duplicados
    // window.api ya está declarado en env.d.ts con todos nuestros métodos custom
  }
}

// Esta declaración es necesaria para que TypeScript no se queje de "duplicate identifier"
// cuando importamos este archivo en múltiples lugares
export {}