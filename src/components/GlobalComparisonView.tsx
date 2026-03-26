import { ModelSession } from '../types/session'
import { parseWekaOutput } from '../utils/wekaParser'
import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts'
import TooltipComp from './Tooltip'
import { Info } from 'lucide-react'

const metricDefinitions: Record<string, string> = {
  'Precisión (%)': 'Porcentaje total de instancias clasificadas correctamente.',
  'Estadística Kappa': 'Mide la calidad de la clasificación descontando el azar.',
  'Error Absoluto (MAE)': 'Promedio de la diferencia absoluta entre predicciones y realidad.',
  'Error Cuadrático Medio (RMSE)': 'Raíz del error cuadrático medio; penaliza errores grandes.',
  'Error Absoluto Relativo (RAE)': 'Error relativo comparado con un predictor simple.',
  'Error Cuadrático Relativo (RRSE)': 'Error cuadrático relativo; vital para detectar fallos.',
  'Área ROC Promedio': 'Capacidad global del modelo para distinguir entre clases.',
  'Área PRC Promedio': 'Precisión-Recall Area; útil para evaluar clases desbalanceadas.',
  'Coef. Matthews (MCC)': 'Medida de calidad que considera VP, VN, FP y FN equilibradamente.',
  'Medida F (F-Measure)': 'Media armónica entre Precisión y Exhaustividad (Recall).',
  'Tiempo Construcción (s)': 'Tiempo dedicado al entrenamiento del modelo.',
  'Tiempo Validación (s)': 'Tiempo dedicado a la evaluación de los datos.'
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
        kappaTrain: d.train?.summary.kappa || 0,
        kappaTest: d.test?.summary.kappa || 0,
        maeTrain: d.train?.summary.mae || 0,
        maeTest: d.test?.summary.mae || 0,
        rmseTrain: d.train?.summary.rmse || 0,
        rmseTest: d.test?.summary.rmse || 0,
        raeTrain: d.train?.summary.rae || 0,
        raeTest: d.test?.summary.rae || 0,
        rrseTrain: d.train?.summary.rrse || 0,
        rrseTest: d.test?.summary.rrse || 0,
        rocTrain: d.train?.weightedAvg?.rocArea || 0,
        rocTest: d.test?.weightedAvg?.rocArea || 0,
        prcTrain: d.train?.weightedAvg?.prcArea || 0,
        prcTest: d.test?.weightedAvg?.prcArea || 0,
        mccTrain: d.train?.weightedAvg?.mcc || 0,
        mccTest: d.test?.weightedAvg?.mcc || 0,
        fMeasureTrain: d.train?.weightedAvg?.fMeasure || 0,
        fMeasureTest: d.test?.weightedAvg?.fMeasure || 0,
        buildTime: d.train?.buildTime || 0,
        testTime: d.test?.testTime || 0,
      }))
  }, [comparisonData])

  const renderTable = (type: 'train' | 'test') => {
    const data = comparisonData.filter(d => d[type])
    if (data.length === 0) return <p className="text-muted">No hay datos de {type === 'train' ? 'entrenamiento' : 'validación'} para comparar.</p>

    const sortedData = [...data].sort((a, b) => {
      const metricsA = a[type]!.summary;
      const metricsB = b[type]!.summary;
      const timeA = type === 'train' ? a.train?.buildTime || 0 : a.test?.testTime || 0;
      const timeB = type === 'train' ? b.train?.buildTime || 0 : b.test?.testTime || 0;

      if (metricsA.incorrectlyClassified !== metricsB.incorrectlyClassified) return metricsA.incorrectlyClassified - metricsB.incorrectlyClassified;
      if (metricsB.kappa !== metricsA.kappa) return metricsB.kappa - metricsA.kappa;
      if (timeA !== timeB) return timeA - timeB;
      return metricsA.rmse - metricsB.rmse;
    })

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', opacity: 0.8, paddingLeft: '0.5rem' }}>
          <Info size={12} className="text-accent" />
          <span>Ordenado por: <strong style={{ color: 'var(--text-main)' }}>Menor Error</strong> → <strong style={{ color: 'var(--text-main)' }}>Kappa</strong> → <strong style={{ color: 'var(--text-main)' }}>Tiempo</strong></span>
        </div>
        <div className="glass-card overflow-x-auto" style={{ padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-dark)', borderBottom: '2px solid var(--border)' }}>
                <th style={thStyle}>Pos.</th>
                <th style={thStyle}>Modelo</th>
                <th style={thStyle}>Prec.</th>
                <th style={thStyle}>Kappa</th>
                <th style={thStyle}>ROC</th>
                <th style={thStyle}>MCC</th>
                <th style={thStyle}>F-M</th>
                <th style={thStyle}>Tiempo</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((d, index) => {
                const metrics = d[type]
                if (!metrics) return null
                const isBest = index === 0
                const time = type === 'train' ? metrics.buildTime : metrics.testTime

                return (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border)', background: isBest ? 'rgba(16, 185, 129, 0.05)' : 'transparent' }}>
                    <td style={tdStyle}>{index + 1}</td>
                    <td style={tdStyle}>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '0.75rem' }}>{d.name}</div>
                      <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{metrics.algorithm}</div>
                    </td>
                    <td style={{ ...tdStyle, color: isBest ? 'var(--success)' : 'var(--text-main)', fontWeight: isBest ? '700' : '400' }}>
                      {metrics.summary.correctlyClassified}%
                    </td>
                    <td style={tdStyle}>{metrics.summary.kappa}</td>
                    <td style={tdStyle}>{metrics.weightedAvg?.rocArea || '-'}</td>
                    <td style={tdStyle}>{metrics.weightedAvg?.mcc || '-'}</td>
                    <td style={tdStyle}>{metrics.weightedAvg?.fMeasure || '-'}</td>
                    <td style={tdStyle}>{time}s</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const StandardChart = ({ id, name, data, dataKeyTrain, dataKeyTest, colorTrain = "var(--accent-primary)", domain }: any) => {
    return (
      <div id={id} className="glass-card" style={{ padding: '1rem', borderTop: `2px solid ${colorTrain}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <TooltipComp text={metricDefinitions[name]} disabled={!isHelpMode}>
            <h4 style={{
              color: isHelpMode ? 'var(--accent-primary)' : 'var(--text-main)',
              fontSize: '0.75rem',
              margin: 0,
              opacity: 0.9,
              fontWeight: '700',
              cursor: isHelpMode ? 'help' : 'default',
              borderBottom: isHelpMode ? '1px dashed var(--accent-primary)' : 'none'
            }}>
              {name}
            </h4>
          </TooltipComp>
        </div>
        <div style={{ height: 160 }}>
          <ResponsiveContainer>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={8} tickLine={false} interval={0} angle={-30} textAnchor="end" height={40} />
              <YAxis stroke="var(--text-muted)" fontSize={8} tickLine={false} axisLine={false} domain={domain} />
              <Tooltip
                contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '10px' }}
                itemStyle={{ color: 'var(--text-main)' }}
                labelStyle={{ color: 'var(--text-main)', fontWeight: 'bold', marginBottom: '4px' }}
              />
              <Bar dataKey={dataKeyTrain} name="Entrenamiento" radius={[2, 2, 0, 0]}>
                {data.map((_: any, index: number) => <Cell key={`c1-${index}`} fill={colorTrain} fillOpacity={0.8} />)}
              </Bar>
              <Bar dataKey={dataKeyTest} name="Validación" radius={[2, 2, 0, 0]}>
                {data.map((_: any, index: number) => <Cell key={`c2-${index}`} fill={colorTrain} fillOpacity={0.3} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '700' }}>
            Comparativa Global de Modelos
          </h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-dark)', padding: '0.3rem 0.6rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
            Grid 4x3 (12 Métricas)
          </span>
        </div>

        {/* Grid Único de 12 Gráficos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          <StandardChart id="g-acc" name="Precisión (%)" data={chartData} dataKeyTrain="entrenamiento" dataKeyTest="validacion" colorTrain="#10b981" domain={[0, 100]} />
          <StandardChart id="g-kappa" name="Estadística Kappa" data={chartData} dataKeyTrain="kappaTrain" dataKeyTest="kappaTest" colorTrain="#3b82f6" />
          <StandardChart id="g-mae" name="Error Absoluto (MAE)" data={chartData} dataKeyTrain="maeTrain" dataKeyTest="maeTest" colorTrain="#6366f1" />

          <StandardChart id="g-rmse" name="Error Cuadrático Medio (RMSE)" data={chartData} dataKeyTrain="rmseTrain" dataKeyTest="rmseTest" colorTrain="#f43f5e" />
          <StandardChart id="g-rae" name="Error Absoluto Relativo (RAE)" data={chartData} dataKeyTrain="raeTrain" dataKeyTest="raeTest" colorTrain="#f59e0b" />
          <StandardChart id="g-rrse" name="Error Cuadrático Relativo (RRSE)" data={chartData} dataKeyTrain="rrseTrain" dataKeyTest="rrseTest" colorTrain="#ec4899" />

          <StandardChart id="g-roc" name="Área ROC Promedio" data={chartData} dataKeyTrain="rocTrain" dataKeyTest="rocTest" colorTrain="#8b5cf6" domain={[0, 1]} />
          <StandardChart id="g-prc" name="Área PRC Promedio" data={chartData} dataKeyTrain="prcTrain" dataKeyTest="prcTest" colorTrain="#06b6d4" domain={[0, 1]} />

          {/* MCC con ajustes especiales de eje y línea de base */}
          <div id="g-mcc" className="glass-card" style={{ padding: '1rem', borderTop: `2px solid #14b8a6` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TooltipComp text={metricDefinitions['Coef. Matthews (MCC)']} disabled={!isHelpMode}>
                <h4 style={{
                  color: isHelpMode ? 'var(--accent-primary)' : 'var(--text-main)',
                  fontSize: '0.75rem',
                  margin: 0,
                  opacity: 0.9,
                  fontWeight: '700',
                  cursor: isHelpMode ? 'help' : 'default',
                  borderBottom: isHelpMode ? '1px dashed var(--accent-primary)' : 'none'
                }}>
                  Coef. Matthews (MCC)
                </h4>
              </TooltipComp>
            </div>
            <div style={{ height: 160 }}>
              <ResponsiveContainer>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <ReferenceLine y={0} stroke="var(--text-muted)" strokeWidth={1} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={8} tickLine={false} interval={0} angle={-30} textAnchor="end" height={40} />
                  <YAxis stroke="var(--text-muted)" fontSize={8} tickLine={false} axisLine={false} domain={[-1, 1]} ticks={[-1, -0.5, 0, 0.5, 1]} />
                  <Tooltip
                    contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '10px' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                    labelStyle={{ color: 'var(--text-main)', fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Bar dataKey="mccTrain" name="Entrenamiento" radius={[2, 2, 0, 0]}>
                    {chartData.map((_, index) => <Cell key={`c1-${index}`} fill="#14b8a6" fillOpacity={0.8} />)}
                  </Bar>
                  <Bar dataKey="mccTest" name="Validación" radius={[2, 2, 0, 0]}>
                    {chartData.map((_, index) => <Cell key={`c2-${index}`} fill="#14b8a6" fillOpacity={0.3} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <StandardChart id="g-fmeas" name="Medida F (F-Measure)" data={chartData} dataKeyTrain="fMeasureTrain" dataKeyTest="fMeasureTest" colorTrain="#d946ef" domain={[0, 1]} />
          <StandardChart id="g-build" name="Tiempo Construcción (s)" data={chartData} dataKeyTrain="buildTime" dataKeyTest="buildTime" colorTrain="#64748b" />
          <StandardChart id="g-val" name="Tiempo Validación (s)" data={chartData} dataKeyTrain="testTime" dataKeyTest="testTime" colorTrain="#475569" />
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2rem', textAlign: 'center', opacity: 0.6 }}>
          Análisis técnico exhaustivo basado en el estándar de minería de datos de Weka.
        </p>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <section className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700', borderLeft: '4px solid var(--success)', paddingLeft: '0.75rem' }}>
            Resultados de Entrenamiento
          </h3>
          {renderTable('train')}
        </section>

        <section className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: '700', borderLeft: '4px solid var(--accent-primary)', paddingLeft: '0.75rem' }}>
            Resultados de Validación
          </h3>
          {renderTable('test')}
        </section>
      </div>
    </div>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '1rem 1.25rem',
  fontSize: '0.7rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  fontWeight: '600',
  letterSpacing: '0.05em',
  borderBottom: '1px solid var(--border)'
}

const tdStyle: React.CSSProperties = {
  padding: '1rem 1.25rem',
  fontSize: '0.8rem',
  color: 'var(--text-main)'
}
