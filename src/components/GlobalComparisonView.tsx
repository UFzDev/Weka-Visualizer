import { ModelSession } from '../types/session'
import { parseWekaOutput } from '../utils/wekaParser'
import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface GlobalComparisonViewProps {
  sessions: ModelSession[]
}

export default function GlobalComparisonView({ sessions }: GlobalComparisonViewProps) {
  const comparisonData = useMemo(() => {
    return sessions.map(session => ({
      id: session.id,
      name: session.name,
      train: parseWekaOutput(session.trainText),
      test: parseWekaOutput(session.testText)
    }))
  }, [sessions])

  const chartData = useMemo(() => {
    return comparisonData
      .filter(d => d.train || d.test)
      .map(d => ({
        name: d.name,
        entrenamiento: d.train?.summary.correctlyClassified || 0,
        validacion: d.test?.summary.correctlyClassified || 0,
      }))
  }, [comparisonData])

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  const renderTable = (type: 'train' | 'test') => {
    const data = comparisonData.filter(d => d[type])
    if (data.length === 0) return <p className="text-muted">No hay datos de {type === 'train' ? 'entrenamiento' : 'validación'} para comparar.</p>

    const sortedData = [...data].sort((a, b) => 
      (b[type]?.summary.correctlyClassified || 0) - (a[type]?.summary.correctlyClassified || 0)
    )

    return (
      <div className="glass-card overflow-x-auto" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-dark)', borderBottom: '2px solid var(--border)' }}>
              <th style={thStyle}>Posición</th>
              <th style={thStyle}>Modelo / Algoritmo</th>
              <th style={thStyle}>Precisión (%)</th>
              <th style={thStyle}>Kappa</th>
              <th style={thStyle}>RMSE</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((d, index) => {
              const metrics = d[type]
              if (!metrics) return null
              const isBest = index === 0

              return (
                <tr key={d.id} style={{ borderBottom: '1px solid var(--border)', background: isBest ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
                  <td style={tdStyle}>{index + 1}</td>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{d.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{metrics.algorithm}</div>
                  </td>
                  <td style={{ ...tdStyle, color: isBest ? 'var(--success)' : 'var(--text-main)', fontWeight: isBest ? '700' : '400' }}>
                    {metrics.summary.correctlyClassified}%
                  </td>
                  <td style={tdStyle}>{metrics.summary.kappa}</td>
                  <td style={tdStyle}>{metrics.summary.rmse}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section className="glass-card" style={{ padding: '1.5rem' }}>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700' }}>
          Análisis entre Modelos
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Gráfico de Precisión */}
          <div id="global-accuracy-chart" style={{ width: '100%' }}>
            <h4 style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.8 }}>Precisión (%)</h4>
            <div style={{ height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'var(--bg-card)', 
                      border: '1px solid var(--border)',
                      borderRadius: '8px',
                      color: 'var(--text-main)'
                    }}
                    itemStyle={{ color: 'var(--text-main)' }}
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  />
                  <Bar dataKey="entrenamiento" name="Entrenamiento" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-t-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                    ))}
                  </Bar>
                  <Bar dataKey="validacion" name="Validación" radius={[4, 4, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-v-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.4} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            {/* Gráfico de Kappa */}
            <div id="global-kappa-chart">
              <h4 style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.8 }}>Estadística Kappa</h4>
              <div style={{ height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={comparisonData.map(d => ({ 
                    name: d.name, 
                    train: d.train?.summary.kappa || 0,
                    test: d.test?.summary.kappa || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }} itemStyle={{ color: 'var(--text-main)' }} />
                    <Bar dataKey="train" name="Kappa Train" fill="var(--accent-primary)" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="test" name="Kappa Test" fill="var(--success)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de RMSE */}
            <div id="global-rmse-chart">
              <h4 style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.8 }}>Error Cuadrático Medio (RMSE)</h4>
              <div style={{ height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={comparisonData.map(d => ({ 
                    name: d.name, 
                    train: d.train?.summary.rmse || 0,
                    test: d.test?.summary.rmse || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }} itemStyle={{ color: 'var(--text-main)' }} />
                    <Bar dataKey="train" name="RMSE Train" fill="#ef4444" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="test" name="RMSE Test" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Error (%) */}
            <div id="global-error-chart">
              <h4 style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.8 }}>Error Local Inexacto (%)</h4>
              <div style={{ height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={comparisonData.map(d => ({ 
                    name: d.name, 
                    train: d.train?.summary.incorrectlyClassified || 0,
                    test: d.test?.summary.incorrectlyClassified || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }} itemStyle={{ color: 'var(--text-main)' }} />
                    <Bar dataKey="train" name="Error Train" fill="#ef4444" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="test" name="Error Test" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico de Tiempos Combine */}
            <div id="global-times-chart">
              <h4 style={{ color: 'var(--text-main)', fontSize: '0.9rem', marginBottom: '1rem', opacity: 0.8 }}>Tiempos de Ejecución (s)</h4>
              <div style={{ height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={comparisonData.map(d => ({ 
                    name: d.name, 
                    build: d.train?.buildTime || 0,
                    test: d.test?.testTime || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={10} tickLine={false} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text-main)' }} itemStyle={{ color: 'var(--text-main)' }} />
                    <Bar dataKey="build" name="Build Time" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="test" name="Test Time" fill="#10b981" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2rem', textAlign: 'center' }}>
          Análisis comparativo de métricas clave entre todos los modelos configurados.
        </p>
      </section>

      <section>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700', borderLeft: '4px solid var(--success)', paddingLeft: '0.75rem' }}>
          Clasificación por Entrenamiento
        </h3>
        {renderTable('train')}
      </section>

      <section>
        <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1.1rem', fontWeight: '700', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
          Clasificación por Validación
        </h3>
        {renderTable('test')}
      </section>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  padding: '1rem',
  textAlign: 'left',
  fontSize: '0.75rem',
  textTransform: 'uppercase',
  color: 'var(--text-muted)',
  letterSpacing: '0.05em'
}

const tdStyle: React.CSSProperties = {
  padding: '1rem',
  fontSize: '0.9rem'
}
