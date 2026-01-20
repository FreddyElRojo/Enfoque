# Enfoque – Pomodoro Minimalista

Aplicación de escritorio minimalista, no invasiva y enfocada en constancia y mejora gradual.  
Tecnologías: Electron + Vite + React + TypeScript + Prisma + SQLite.

### Estado actual (enero 2026)

- Timer Pomodoro con modos configurables (trabajo / descanso corto / largo)
- Ciclos automáticos (long break cada 4 pomodoros)
- Configuración personalizada guardada en DB local (edición desde UI con actualización automática del timer)
- Estética vidrio esmerilado sutil y ventana transparente
- Progreso parcial diario preciso (suma tiempo real cada 5 segundos en modo trabajo, pérdida máxima ~5s)
- Registro de DailyLog (horas trabajadas exactas + goalsMet basado en objetivo configurable)
- Racha inicial (días consecutivos con goal cumplido) con mensajes win-win motivadores
- Código refactorizado y modularizado (hooks dedicados + componentes puros + comentarios detallados en todos los archivos)
- Commits detallados con historial claro y limpio

### Próximas features planeadas

- Feature de tareas minimalista 
- Opción configurable: requerir tarea activa para iniciar timer (default off)
- Pulido visual 
- Historial y estadísticas simples (precisión semanal de estimaciones, días parciales)
- Posible bloqueador básico (hosts file durante work)

### Tecnologías

- Electron (ventana desktop transparente)
- Vite + React + TypeScript (renderer/UI)
- Prisma + SQLite (base de datos local persistente)
- react-timer-hook (gestión del countdown)
- CSS Modules (estilos modulares y escalables)

### Instalación y desarrollo

```bash
git clone https://github.com/FreddyElRojo/enfoque.git
cd enfoque
npm install
npm run dev