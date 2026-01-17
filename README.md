# Enfoque – Pomodoro Personal

Aplicación de escritorio minimalista y no invasiva para mejorar la concentración usando la técnica Pomodoro.  
Hecha con **Electron + Vite + React + TypeScript + Prisma + SQLite**.

### Estado actual (enero 2026)

- Timer Pomodoro con modos: trabajo / descanso corto / descanso largo
- Ciclos automáticos (long break cada 4 pomodoros)
- Configuración personalizada de tiempos (guardada en DB local)
- Edición de tiempos desde la UI con guardado automático en DB
- Base de datos SQLite con Prisma (persistencia de settings)
- IPC seguro entre procesos main y renderer

### Próximas implementaciones planeadas

- Registro automático de progreso diario (DailyLog: horas trabajadas, goals cumplidos)
- Cálculo y visualización de racha actual (días consecutivos enfocados)
- Bloqueador de distracciones (ej: YouTube vía hosts file durante modo trabajo)
- Notificaciones y sonido suave al finalizar ciclos
- Historial y estadísticas (días pasados, total horas, gráficos simples)
- Mejoras visuales (progreso circular, animaciones suaves, tema oscuro opcional)
- Exportar datos / backup de DB
- Posible soporte multi-perfil (futuro lejano)

### Tecnologías

- Electron (ventana desktop)
- Vite + React + TypeScript (renderer/UI)
- Prisma + SQLite (base de datos local)
- react-timer-hook (gestión del countdown)
- CSS Modules (estilos separados y escalables)

### Instalación y desarrollo

```bash
git clone https://github.com/TU_USUARIO/enfoque-pomodoro.git
cd enfoque-pomodoro
npm install
npm run dev