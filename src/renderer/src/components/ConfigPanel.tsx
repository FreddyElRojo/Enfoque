/*Este componente es el panel de configuración de la app.
Su responsabilidad es mostrar los tiempos actuales (trabajo, descanso corto, largo) 
y permitir al usuario editarlos y guardarlos en la base de datos.*/

import styles from '../App.module.css'

// Definimos el tipo Settings (el mismo que usa toda la app para settings de usuario)
// Esto asegura consistencia de tipos entre componentes y hooks
type Settings = {
  id: number
  workTime: number
  breakTime: number
  longBreak: number
  createdAt: Date | string
}

// Props que recibe el componente desde App.tsx
// Todas son necesarias para mantener la lógica de edición y guardado
type ConfigPanelProps = {
  editMode: boolean                        // Indica si estamos editando o viendo valores actuales
  tempSettings: Partial<Settings>          // Estado temporal con valores que el usuario está editando
  setTempSettings: React.Dispatch<React.SetStateAction<Partial<Settings>>> // Función para actualizar tempSettings en tiempo real
  saveSettings: () => Promise<void>        // Función que guarda en DB (viene de App.tsx)
  setEditMode: React.Dispatch<React.SetStateAction<boolean>> // Cambia entre modo vista/edición
  settings: Settings | null                // Valores actuales desde DB (para mostrar cuando no editamos)
}

export const ConfigPanel = ({
  editMode,
  tempSettings,
  setTempSettings,
  saveSettings,
  setEditMode,
  settings
}: ConfigPanelProps) => {
  return (
    // Contenedor principal del panel (estilo vidrio esmerilado, fondo sutil)
    <div className={styles.configSection}>
      {/* Título fijo del panel */}
      <h3 className={styles.configTitle}>Configuración</h3>

      {/* Vista condicional: edición vs lectura */}
      {editMode ? (
        // Modo edición: inputs + botones
        <div>
          {/* Input para tiempo de trabajo */}
          <div className={styles.configLabel}>
            <label>Trabajo (min):</label>
            <input 
              type="number" 
              value={tempSettings.workTime ?? 25} // Usa valor temporal o default
              onChange={e => setTempSettings({ ...tempSettings, workTime: Number(e.target.value) })} // Actualiza estado temporal en tiempo real
              min="1" // Evita valores negativos o cero
              className={styles.configInput}
            />
          </div>
          
          {/* Input para descanso corto */}
          <div className={styles.configLabel}>
            <label>Descanso corto (min):</label>
            <input 
              type="number" 
              value={tempSettings.breakTime ?? 5}
              onChange={e => setTempSettings({ ...tempSettings, breakTime: Number(e.target.value) })}
              min="1"
              className={styles.configInput}
            />
          </div>
          
          {/* Input para descanso largo */}
          <div className={styles.configLabel}>
            <label>Descanso largo (min):</label>
            <input 
              type="number" 
              value={tempSettings.longBreak ?? 15}
              onChange={e => setTempSettings({ ...tempSettings, longBreak: Number(e.target.value) })}
              min="1"
              className={styles.configInput}
            />
          </div>

          {/* Botones de acción */}
          <div className={styles.configButtons}>
            {/* Guarda en DB y cierra edición */}
            <button onClick={saveSettings} className={`${styles.button} ${styles.saveButton}`}>
              Guardar
            </button>
            {/* Cancela edición sin guardar */}
            <button onClick={() => setEditMode(false)} className={`${styles.button} ${styles.cancelButton}`}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        // Modo lectura: muestra valores actuales y botón para entrar en edición
        <div>
          <p>Trabajo: {settings?.workTime || 25} min</p>
          <p>Descanso corto: {settings?.breakTime || 5} min</p>
          <p>Descanso largo: {settings?.longBreak || 15} min</p>
          <button onClick={() => setEditMode(true)} className={styles.button}>
            Editar
          </button>
        </div>
      )}
    </div>
  )
}