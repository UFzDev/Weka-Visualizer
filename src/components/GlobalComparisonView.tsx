import { ModelSession } from '../types/session'
import { parseWekaOutput } from '../utils/wekaParser'
import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import TooltipComp from './Tooltip'
import { HelpCircle, Info } from 'lucide-react'

const metricDefinitions: Record<string, string> = {
  'Precisión (%)': 'Muestra el porcentaje total de aciertos de cada modelo. Por ejemplo, un 95% significa que el modelo clasificó correctamente 95 de cada 100 registros.',
  'Estadística Kappa': 'Mide la calidad de la clasificación comparándola con lo que ocurriría por puro azar. Un valor cercano a 1.0 es excelente; un 0 significa que el modelo no es mejor que una adivinanza aleatoria.',
  'Error Cuadrático Medio (RMSE)': 'Indica cuánto se desvían las predicciones de la realidad en una escala numérica. Cuanto más bajo sea este valor, "más fino" es el modelo en sus cálculos.',
  'Error Local Inexacto (%)': 'Indica el porcentaje de registros que el modelo clasificó en la categoría equivocada. Es el complemento de la precisión.',
  'Tiempos de Ejecución (s)': 'Compara cuánto tardó cada modelo en construirse (entrenar) frente a cuánto tardó en evaluar los datos de prueba.',
  'Error Absoluto Relativo (RAE)': 'Compara el error del modelo con un predictor simple que solo usa la media. Un valor bajo (cercano al 0%) indica un gran desempeño frente a lo básico.',
  'Error Cuadrático Relativo (RRSE)': 'Similar al RAE pero penaliza más los errores grandes. Es vital para asegurar que el modelo no tenga fallos catastróficos.'
};

interface GlobalComparisonViewProps {
  sessions: ModelSession[];
  isHelpMode?: boolean;
}

export default function GlobalComparisonView({ sessions, isHelpMode }: GlobalComparisonViewProps) {
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

    const sortedData = [...data].sort((a, b) => {
      const metricsA = a[type]!.summary;
      const metricsB = b[type]!.summary;
      const timeA = type === 'train' ? a.train?.buildTime || 0 : a.test?.testTime || 0;
      const timeB = type === 'train' ? b.train?.buildTime || 0 : b.test?.testTime || 0;

      // 1. Error (Inexacto) - Menor es mejor
      if (metricsA.incorrectlyClassified !== metricsB.incorrectlyClassified) {
        return metricsA.incorrectlyClassified - metricsB.incorrectlyClassified;
      }
      // 2. Kappa - Mayor es mejor (Asegura que no es azar)
      if (metricsB.kappa !== metricsA.kappa) {
        return metricsB.kappa - metricsA.kappa;
      }
      // 3. Tiempo - Menor es mejor (Eficiencia)
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      // 4. RMSE - Menor es mejor (Precisión numérica)
      return metricsA.rmse - metricsB.rmse;
    })

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.8, paddingLeft: '0.5rem' }}>
          <Info size={12} className="text-accent" />
          <span>Ordenado por: <strong style={{color: 'var(--text-main)'}}>Menor Error</strong> → <strong style={{color: 'var(--text-main)'}}>Kappa</strong> → <strong style={{color: 'var(--text-main)'}}>Tiempo</strong></span>
        </div>
        <div className="glass-card overflow-x-auto" style={{ padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-dark)', borderBottom: '2px solid var(--border)' }}>
              <th style={thStyle}>Posición</th>
              <th style={thStyle}>Modelo / Algoritmo</th>
              <th style={thStyle}>
                <TooltipComp text={metricDefinitions['Precisión (%)']} disabled={!isHelpMode}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: isHelpMode ? 'help' : 'default',
                    color: isHelpMode ? 'var(--accent-primary)' : 'inherit',
                    borderBottom: isHelpMode ? '1px dashed var(--accent-primary)' : 'none'
                  }}>
                    Precisión (%)
                    {isHelpMode && <HelpCircle size={12} />}
                  </div>
                </TooltipComp>
              </th>
              <th style={thStyle}>
                <TooltipComp text={metricDefinitions['Estadística Kappa']} disabled={!isHelpMode}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: isHelpMode ? 'help' : 'default',
                    color: isHelpMode ? 'var(--accent-primary)' : 'inherit',
                    borderBottom: isHelpMode ? '1px dashed var(--accent-primary)' : 'none'
                  }}>
                    Kappa
                    {isHelpMode && <HelpCircle size={12} />}
                  </div>
                </TooltipComp>
              </th>
              <th style={thStyle}>
                <TooltipComp text={metricDefinitions['Error Cuadrático Medio (RMSE)']} disabled={!isHelpMode}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: isHelpMode ? 'help' : 'default',
                    color: isHelpMode ? 'var(--accent-primary)' : 'inherit',
                    borderBottom: isHelpMode ? '1px dashed var(--accent-primary)' : 'none'
                  }}>
                    RMSE
                    {isHelpMode && <HelpCircle size={12} />}
                  </div>
                </TooltipComp>
              </th>
              <th style={thStyle}>
                <TooltipComp text={metricDefinitions['Error Absoluto Relativo (RAE)']} disabled={!isHelpMode}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: isHelpMode ? 'help' : 'default',
                    color: isHelpMode ? 'var(--accent-primary)' : 'inherit',
                    borderBottom: isHelpMode ? '1px dashed var(--accent-primary)' : 'none'
                  }}>
                    RAE
                    {isHelpMode && <HelpCircle size={12} />}
                  </div>
                </TooltipComp>
              </th>
              <th style={thStyle}>
                <TooltipComp text={metricDefinitions['Error Cuadrático Relativo (RRSE)']} disabled={!isHelpMode}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    cursor: isHelpMode ? 'help' : 'default',
                    color: isHelpMode ? 'var(--accent-primary)' : 'inherit',
                    borderBottom: isHelpMode ? '1px dashed var(--accent-primary)' : 'none'
                  }}>
                    RRSE
                    {isHelpMode && <HelpCircle size={12} />}
                  </div>
                </TooltipComp>
              </th>
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
                  <td style={tdStyle}>{metrics.summary.rae}%</td>
                  <td style={tdStyle}>{metrics.summary.rrse}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TooltipComp text={metricDefinitions['Precisión (%)']} disabled={!isHelpMode}>
                <h4 style={{
                  color: isHelpMode ? 'var(--accent-primary)' : 'var(--text-main)',
                  fontSize: '0.9rem',
                  margin: 0,
                  opacity: 0.8,
                  cursor: isHelpMode ? 'help' : 'default',
                  borderBottom: isHelpMode ? '1px dashed var(--accent-primary)' : 'none'
                }}>
                  Precisión (%)
                </h4>
              </TooltipComp>
              {isHelpMode && <HelpCircle size={14} style={{ color: 'var(--accent-primary)', opacity: 0.7 }} />}
            </div>
            <div style={{ height: 250 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    stroke="var(--text-muted)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <TooltipComp text={metricDefinitions['Estadística Kappa']} disabled={!isHelpMode}>
                  <h4 style={{
                    color: isHelpMode ? 'var(--accent-primary)' : 'var(--text-main)',
                    fontSize: '0.9rem',
                    margin: 0,
                    opacity: 0.8,
                    cursor: isHelpMode ? 'help' : 'default',
                    borderBottom: isHelpMode ? '1px dashed var(--accent-primary)' : 'none'
                  }}>
                    Estadística Kappa
                  </h4>
                </TooltipComp>
                {isHelpMode && <HelpCircle size={14} style={{ color: 'var(--accent-primary)', opacity: 0.7 }} />}
              </div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={comparisonData.map(d => ({
                    name: d.name,
                    train: d.train?.summary.kappa || 0,
                    test: d.test?.summary.kappa || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="var(--text-muted)"
                      fontSize={10}
                      tickLine={false}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <TooltipComp text={metricDefinitions['Error Cuadrático Medio (RMSE)']} disabled={!isHelpMode}>
                  <h4 style={{
                    color: isHelpMode ? 'var(--accent-primary)' : 'var(--text-main)',
                    fontSize: '0.9rem',
                    margin: 0,
                    opacity: 0.8,
                    cursor: isHelpMode ? 'help' : 'default',
                    borderBottom: isHelpMode ? '1px dashed var(--accent-primary)' : 'none'
                  }}>
                    Error Cuadrático Medio (RMSE)
                  </h4>
                </TooltipComp>
                {isHelpMode && <HelpCircle size={14} style={{ color: 'var(--accent-primary)', opacity: 0.7 }} />}
              </div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={comparisonData.map(d => ({
                    name: d.name,
                    train: d.train?.summary.rmse || 0,
                    test: d.test?.summary.rmse || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="var(--text-muted)"
                      fontSize={10}
                      tickLine={false}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <TooltipComp text={metricDefinitions['Error Local Inexacto (%)']} disabled={!isHelpMode}>
                  <h4 style={{
                    color: isHelpMode ? 'var(--accent-primary)' : 'var(--text-main)',
                    fontSize: '0.9rem',
                    margin: 0,
                    opacity: 0.8,
                    cursor: isHelpMode ? 'help' : 'default',
                    borderBottom: isHelpMode ? '1px dashed var(--accent-primary)' : 'none'
                  }}>
                    Error Local Inexacto (%)
                  </h4>
                </TooltipComp>
                {isHelpMode && <HelpCircle size={14} style={{ color: 'var(--accent-primary)', opacity: 0.7 }} />}
              </div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={comparisonData.map(d => ({
                    name: d.name,
                    train: d.train?.summary.incorrectlyClassified || 0,
                    test: d.test?.summary.incorrectlyClassified || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="var(--text-muted)"
                      fontSize={10}
                      tickLine={false}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <TooltipComp text={metricDefinitions['Tiempos de Ejecución (s)']} disabled={!isHelpMode}>
                  <h4 style={{
                    color: isHelpMode ? 'var(--accent-primary)' : 'var(--text-main)',
                    fontSize: '0.9rem',
                    margin: 0,
                    opacity: 0.8,
                    cursor: isHelpMode ? 'help' : 'default',
                    borderBottom: isHelpMode ? '1px dashed var(--accent-primary)' : 'none'
                  }}>
                    Tiempos de Ejecución (s)
                  </h4>
                </TooltipComp>
                {isHelpMode && <HelpCircle size={14} style={{ color: 'var(--accent-primary)', opacity: 0.7 }} />}
              </div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer>
                  <BarChart data={comparisonData.map(d => ({
                    name: d.name,
                    build: d.train?.buildTime || 0,
                    test: d.test?.testTime || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke="var(--text-muted)"
                      fontSize={10}
                      tickLine={false}
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={60}
                    />
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
