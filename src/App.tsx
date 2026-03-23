
function App() {
  const versions = {
    bun: '1.3.10',
    vite: '5.4.10',
    react: '18.3.1',
  }

  return (
    <main className="container">
      <div className="glass-card">
        <div className="header">
          <span className="badge">Template</span>
          <h1>Bun + Vite + React</h1>
          <p className="subtitle">Configuración de alto rendimiento para desarrollo moderno.</p>
        </div>

        <div className="version-grid">
          <div className="version-item">
            <span className="label">Bun</span>
            <span className="value">v{versions.bun}</span>
          </div>
          <div className="version-item">
            <span className="label">Vite</span>
            <span className="value">v{versions.vite}</span>
          </div>
          <div className="version-item">
            <span className="label">React</span>
            <span className="value">v{versions.react}</span>
          </div>
        </div>

        <div className="status-indicator">
          <div className="dot"></div>
          <span>Listo para producción</span>
        </div>
      </div>
    </main>
  )
}

export default App
