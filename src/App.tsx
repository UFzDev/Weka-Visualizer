import { useState, useMemo } from 'react'
import { parseWekaOutput, WekaParsedData } from './utils/wekaParser'
import MetricsGrid from './components/MetricsGrid'
import ConfusionMatrix from './components/ConfusionMatrix'
import ComparisonView from './components/ComparisonView'

function App() {
  const [trainText, setTrainText] = useState('')
  const [testText, setTestText] = useState('')
  const [activeTab, setActiveTab] = useState<'train' | 'test' | 'compare'>('train')
  
  const trainData = useMemo<WekaParsedData | null>(() => parseWekaOutput(trainText), [trainText])
  const testData = useMemo<WekaParsedData | null>(() => parseWekaOutput(testText), [testText])

  const currentData = activeTab === 'train' ? trainData : testData

  return (
    <main className="container animate-in">
      <header style={{ marginBottom: '2.5rem', textAlign: 'left', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-main)', letterSpacing: '-0.025em' }}>
          Weka Visualizer
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
          Análisis de Modelos
        </p>
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
                value={activeTab === 'train' ? trainText : testText}
                onChange={(e) => activeTab === 'train' ? setTrainText(e.target.value) : setTestText(e.target.value)}
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
    </main>
  )
}

export default App
