import { useState, useMemo, useEffect } from 'react'
import { parseWekaOutput, WekaParsedData } from './utils/wekaParser'
import MetricsGrid from './components/MetricsGrid'
import ConfusionMatrix from './components/ConfusionMatrix'
import ComparisonView from './components/ComparisonView'
import { DefaultToggle } from '@/components/ui/theme-toggle'
import { ModelSession, TabType } from './types/session'
import { Download, Upload } from 'lucide-react'
import { useRef } from 'react'

const STORAGE_KEY = 'weka-sessions'

const DEFAULT_SESSIONS: ModelSession[] = [
  { id: '1', name: 'Modelo 1', trainText: '', testText: '' }
]

function App() {
  const [sessions, setSessions] = useState<ModelSession[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : DEFAULT_SESSIONS
  })
  const [activeSessionId, setActiveSessionId] = useState<string>(sessions[0]?.id || '1')
  const [activeTab, setActiveTab] = useState<TabType>('train')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Persistencia
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  }, [sessions])

  const activeSession = useMemo(() => 
    sessions.find(s => s.id === activeSessionId) || sessions[0], 
    [sessions, activeSessionId]
  )

  const trainData = useMemo<WekaParsedData | null>(() => 
    parseWekaOutput(activeSession.trainText), 
    [activeSession.trainText]
  )
  const testData = useMemo<WekaParsedData | null>(() => 
    parseWekaOutput(activeSession.testText), 
    [activeSession.testText]
  )

  const currentData = activeTab === 'train' ? trainData : testData

  // Auto-renombrar pestaña al detectar algoritmo
  useEffect(() => {
    const detectedAlgo = trainData?.algorithm || testData?.algorithm
    if (detectedAlgo && (activeSession.name.startsWith('Modelo ') || activeSession.name === '')) {
      renameSession(activeSessionId, detectedAlgo)
    }
  }, [trainData?.algorithm, testData?.algorithm, activeSessionId])

  const updateSessionText = (text: string, type: 'train' | 'test') => {
    setSessions(prev => prev.map(s => 
      s.id === activeSessionId 
        ? { ...s, [type === 'train' ? 'trainText' : 'testText']: text }
        : s
    ))
  }

  const addSession = () => {
    const newId = crypto.randomUUID()
    const newSession: ModelSession = {
      id: newId,
      name: `Modelo ${sessions.length + 1}`,
      trainText: '',
      testText: ''
    }
    setSessions(prev => [...prev, newSession])
    setActiveSessionId(newId)
  }

  const removeSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (sessions.length === 1) return
    const newSessions = sessions.filter(s => s.id !== id)
    setSessions(newSessions)
    if (activeSessionId === id) {
      setActiveSessionId(newSessions[0].id)
    }
  }

  const renameSession = (id: string, newName: string) => {
    setSessions(prev => prev.map(s => 
      s.id === id ? { ...s, name: newName } : s
    ))
  }

  const exportData = () => {
    const dataStr = JSON.stringify(sessions, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `weka-visualizer-export-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string)
        if (Array.isArray(imported) && imported.length > 0) {
          setSessions(imported)
          setActiveSessionId(imported[0].id)
        }
      } catch (err) {
        alert('Error al importar el archivo. Asegúrate de que es un JSON válido de Weka Visualizer.')
      }
    }
    reader.readAsText(file)
  }

  return (
    <main className="container animate-in">
      <header style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
            Weka Visualizer
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Análisis de Modelos
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input 
            type="file" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            accept=".json"
            onChange={importData}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="btn-primary flex-center" 
            style={{ gap: '0.4rem', padding: '0.5rem 0.8rem' }}
            title="Importar de JSON"
          >
            <Upload size={14} />
            Importar
          </button>
          <button 
            onClick={exportData}
            className="btn-primary flex-center" 
            style={{ gap: '0.4rem', padding: '0.5rem 0.8rem' }}
            title="Exportar a JSON"
          >
            <Download size={14} />
            Exportar
          </button>
          <div style={{ borderLeft: '1px solid var(--border)', height: '2rem', margin: '0 0.5rem' }} />
          <DefaultToggle />
        </div>
      </header>

      {/* Navegación Principal */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem' }}>
        <button 
          onClick={() => setActiveTab('train')}
          className={`btn-primary ${activeTab === 'train' ? 'active' : ''}`}
        >
          Entrenamiento
        </button>
        <button 
          onClick={() => setActiveTab('test')}
          className={`btn-primary ${activeTab === 'test' ? 'active' : ''}`}
        >
          Validación
        </button>
        <button 
          onClick={() => setActiveTab('compare')}
          className={`btn-primary ${activeTab === 'compare' ? 'active' : ''}`}
          style={{ fontWeight: 'bold' }}
        >
          Comparativa
        </button>
      </div>

      {/* Resultados Globales (Algoritmo) */}
      {(trainData || testData) && (
        <div className="glass-card animate-in" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
           <div style={{ flex: 1 }}>
             <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Algoritmo del Modelo</span>
             <h4 style={{ color: 'var(--text-main)', fontSize: '1.1rem', marginTop: '0.2rem' }}>{trainData?.algorithm || testData?.algorithm}</h4>
           </div>
           {trainData && testData && trainData.algorithm !== testData.algorithm && (
             <div style={{ color: 'var(--error)', fontSize: '0.75rem', fontWeight: 'bold', marginTop: '0.5rem' }}>Advertencia: Los algoritmos no coinciden</div>
           )}
        </div>
      )}

      {activeTab === 'compare' ? (
        <ComparisonView train={trainData} test={testData} />
      ) : (
        <>
          <div className="grid-cols-auto">
            {/* Input Section */}
            <section className="glass-card" style={{ gridColumn: 'span 1' }}>
              <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>
                {activeTab === 'train' ? 'Output de Entrenamiento' : 'Output de Validación/Test'}
              </h3>
              <textarea 
                placeholder={`Pega el output de Weka para ${activeTab === 'train' ? 'entrenamiento' : 'validación'}...`} 
                rows={12}
                value={activeTab === 'train' ? activeSession.trainText : activeSession.testText}
                onChange={(e) => updateSessionText(e.target.value, activeTab === 'train' ? 'trainText' : 'testText' as any)}
              />
            </section>

            {/* Individual Summary Stats */}
            {currentData ? (
              <section style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="grid-cols-auto" style={{ gap: '1rem' }}>
                  <div className="glass-card" style={{ textAlign: 'center', borderTop: '3px solid var(--success)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Precisión</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.25rem' }}>{currentData.summary.correctlyClassified}%</div>
                  </div>
                  <div className="glass-card" style={{ textAlign: 'center', borderTop: '3px solid var(--accent-primary)' }}>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '600' }}>Kappa</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)', marginTop: '0.25rem' }}>{currentData.summary.kappa}</div>
                  </div>
                </div>

                <div className="glass-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>RMSE:</span>
                    <span style={{ fontWeight: '600' }}>{currentData.summary.rmse}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tiempo Compilación:</span>
                    <span style={{ fontWeight: '600' }}>{currentData.buildTime}s</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tiempo Evaluación:</span>
                    <span style={{ fontWeight: '600' }}>{currentData.testTime}s</span>
                  </div>
                </div>
              </section>
            ) : (
              <div className="glass-card flex-center" style={{ color: 'var(--text-muted)', textAlign: 'center', minHeight: '200px', borderStyle: 'dashed' }}>
                Esperando datos para el análisis...
              </div>
            )}
          </div>

          {currentData && (
            <>
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>Detalle de Precisión por Clase</h3>
                <MetricsGrid metrics={currentData.detailedAccuracy} />
              </div>
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1rem', fontWeight: '600' }}>Matriz de Confusión</h3>
                <ConfusionMatrix labels={currentData.confusionMatrix.labels} matrix={currentData.confusionMatrix.matrix} />
              </div>
            </>
          )}
        </>
      )}

      <footer style={{ marginTop: '4rem', textAlign: 'left', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.8rem', borderTop: '1px solid var(--border)' }}>
        Weka Visualizer — Herramienta de Ingeniería
      </footer>

      {/* Excel-style Model Tabs */}
      <div className="excel-tabs">
        <div className="excel-tabs-container">
          {sessions.map((session) => (
            <div 
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`excel-tab ${activeSessionId === session.id ? 'active' : ''}`}
            >
              <input 
                value={session.name} 
                onChange={(e) => renameSession(session.id, e.target.value)}
                className="excel-tab-input"
                title="Doble clic para renombrar (función nativa de input)"
              />
              {sessions.length > 1 && (
                <button 
                  onClick={(e) => removeSession(session.id, e)}
                  className="excel-tab-close"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button onClick={addSession} className="excel-tab-add">
            +
          </button>
        </div>
      </div>
    </main>
  )
}

export default App
