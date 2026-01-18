/*Este archivo es el punto de entrada principal del renderer process (la parte React de la aplicación).
Es el script que Vite compila y ejecuta primero cuando carga la página web dentro de la ventana Electron.
Responsabilidad única y concisa:

Importa los estilos globales.
Crea la raíz de React en el DOM.
Renderiza el componente raíz <App /> en modo estricto (StrictMode).
Conecta todo el árbol de React con el HTML base (index.html).*/


// Importa los estilos globales de la app
// Este archivo CSS contiene reglas base (reset, fuentes, colores generales)
// Se aplica a toda la UI antes de que React renderice componentes
// Interrelación: estilos de App.module.css y otros módulos se suman encima de estos
import './assets/main.css'

// Importamos StrictMode (modo estricto de React) para desarrollo
// Activa chequeos adicionales: double render en dev, detecta efectos obsoletos, etc.
// No afecta producción (se elimina automáticamente en build)
import { StrictMode } from 'react'

// Importamos createRoot (nueva API de React 18 para renderizado concurrente)
import { createRoot } from 'react-dom/client'

// Importamos el componente raíz de la app
// Todo el árbol React (hooks, componentes, estado, timer, configuración) parte de aquí
import App from './App'

// Buscamos el elemento #root en index.html (creado por Vite)
// El ! fuerza non-null assertion (sabemos que existe porque está en index.html)
const rootElement = document.getElementById('root')!

// Creamos la raíz de React y renderizamos la app
// StrictMode envuelve App para activar chequeos de desarrollo
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
)