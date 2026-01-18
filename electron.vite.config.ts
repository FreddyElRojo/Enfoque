/*Este es el archivo de configuración central de Vite + Electron-Vite.
Es el que le dice a Vite (y a electron-vite) cómo compilar y empaquetar las tres partes separadas de la app Electron:

main (proceso principal: src/main/index.ts)
preload (puente de seguridad: src/preload/index.ts)
renderer (la UI React: src/renderer/src/main.tsx y todo el árbol)

Responsabilidad única y concisa:

Definir configuraciones específicas para cada entorno (main, preload, renderer).
Configurar aliases (atajos de importación) para el renderer.
Habilitar plugins necesarios (como @vitejs/plugin-react para JSX/TSX).
Facilitar el desarrollo (hot module replacement en dev) y el build (optimizado para prod).*/


// Importamos resolve de path para crear rutas absolutas seguras
// Esto evita problemas de paths relativos en diferentes entornos (dev/prod)
import { resolve } from 'path'

// Importamos defineConfig de electron-vite
// Esta función crea una configuración que electron-vite entiende automáticamente
// Separa config para main, preload y renderer (los 3 procesos de Electron)
import { defineConfig } from 'electron-vite'

// Plugin oficial de Vite para React
// Habilita soporte completo para JSX/TSX, HMR, fast refresh, SWC (compilador rápido), etc.
import react from '@vitejs/plugin-react'

// Configuración global de electron-vite
// defineConfig recibe un objeto con tres propiedades: main, preload, renderer
// Cada una puede tener su propia configuración de Vite
export default defineConfig({
  // Configuración para el proceso main (src/main/index.ts)
  // Por ahora vacío → usa defaults de electron-vite (suficiente para la mayoría)
  // Si más adelante necesitás plugins o aliases específicos para main, se agregan aquí
  main: {},

  // Configuración para el preload (src/preload/index.ts)
  // También vacío → usa defaults
  // El preload es pequeño y no necesita React ni nada especial
  preload: {},

  // Configuración específica para el renderer (la parte React: src/renderer/src)
  // Aquí ponemos lo más importante porque es donde vive toda la UI
  renderer: {
    // Alias para imports limpios en todo el código del renderer
    // @renderer apunta a src/renderer/src → permite imports como import App from '@renderer/App'
    // Evita paths largos y mejora mantenibilidad
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },

    // Plugins específicos del renderer
    // react() habilita todo lo necesario para React + TypeScript + JSX + HMR
    // Es esencial para que Vite compile correctamente App.tsx, hooks y componentes
    plugins: [react()]
  }
})