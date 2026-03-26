import React from 'react';
import { WekaParsedData } from '../utils/wekaParser';
import Tooltip from './Tooltip';
import { HelpCircle } from 'lucide-react';

interface ComparisonViewProps {
  train: WekaParsedData | null;
  test: WekaParsedData | null;
  isHelpMode?: boolean;
}

const metricDefinitions: Record<string, string> = {
  'Precisión Global (%)': 'Muestra el porcentaje total de aciertos del modelo. Por ejemplo, un 95% significa que el modelo acertó en 95 de cada 100 casos presentados.',
  'Índice Kappa': 'Mide la calidad de la clasificación comparándola con el azar. Un valor de 1.0 es una predicción perfecta, mientras que 0 indica que el modelo no es mejor que una adivinanza aleatoria.',
  'Error Absoluto (MAE)': 'Promedio de la diferencia absoluta entre las predicciones y los valores reales. Es una medida robusta que indica la magnitud del error sin penalizar excesivamente los valores atípicos.',
  'Error Cuadrático (RMSE)': 'Indica cuánto se alejan las predicciones de los valores reales. Mientras más bajo sea este número, más preciso es el modelo en sus estimaciones numéricas.',
  'Error Absoluto Relativo (RAE)': 'Compara el error del modelo con un modelo simple que solo predice la media. Un valor bajo (cercano al 0%) indica un gran desempeño frente a lo básico.',
  'Error Cuadrático Relativo (RRSE)': 'Similar al RAE pero penaliza más los errores grandes. Es vital para asegurar que el modelo no tenga fallos catastróficos.',
  'Área ROC Promedio': 'Mide la capacidad del modelo para distinguir entre clases. Un valor de 1.0 es perfecto, mientras que 0.5 indica un modelo que predice al azar.',
  'Área PRC Promedio': 'Mide la calidad de la precisión y exhaustividad, especialmente vital cuando hay desbalance entre clases.',
  'Coef. Matthews (MCC)': 'La medida más confiable de calidad para clasificación binaria y multi-clase, oscila entre -1 y +1.',
  'Medida F (F-Measure)': 'Un balance (media armónica) entre Precisión y Exhaustividad. Ideal para evaluar la solidez general del modelo.',
  'Tiempo Construcción (s)': 'Es el tiempo que el algoritmo dedicó a "estudiar" los datos para generar el cerebro (modelo) que realizará las predicciones matemáticas.',
  'Tiempo Validación (s)': 'Es el tiempo que tardó el modelo ya entrenado en procesar y evaluar los datos de prueba o validación.',
  'Medida F por Clase (Comparativa)': 'Un equilibrio entre precisión y exhaustividad por cada categoría. Es la mejor forma de saber si el modelo es realmente bueno en una clase específica sin sesgos.'
};

const ComparisonView: React.FC<ComparisonViewProps> = ({ train, test, isHelpMode }) => {
  if (!train && !test) {
    return (
      <div className="glass-card flex-center animate-in" style={{ padding: '4rem', flexDirection: 'column', borderStyle: 'dashed' }}>
        <p style={{ color: 'var(--text-muted)' }}>Introduce datos en Entrenamiento y Validación para comparar.</p>
      </div>
    );
  }

  const metrics = [
    { name: 'Precisión Global (%)', train: train?.summary.correctlyClassified || 0, test: test?.summary.correctlyClassified || 0, max: 100, threshold: 5 },
    { name: 'Índice Kappa', train: train?.summary.kappa || 0, test: test?.summary.kappa || 0, max: 1, threshold: 0.05, label: (v: number) => v.toFixed(3) },
    { name: 'Error Absoluto (MAE)', train: train?.summary.mae || 0, test: test?.summary.mae || 0, max: 1, isInverse: true, threshold: 0.02, label: (v: number) => v.toFixed(4) },
    { name: 'Error Cuadrático (RMSE)', train: train?.summary.rmse || 0, test: test?.summary.rmse || 0, max: 1, isInverse: true, threshold: 0.02, label: (v: number) => v.toFixed(4) },
    { name: 'Error Absoluto Relativo (RAE)', train: train?.summary.rae || 0, test: test?.summary.rae || 0, max: 100, isInverse: true, threshold: 15, label: (v: number) => `${v.toFixed(2)}%` },
    { name: 'Error Cuadrático Relativo (RRSE)', train: train?.summary.rrse || 0, test: test?.summary.rrse || 0, max: 100, isInverse: true, threshold: 15, label: (v: number) => `${v.toFixed(2)}%` },
    { name: 'Área ROC Promedio', train: train?.weightedAvg?.rocArea || 0, test: test?.weightedAvg?.rocArea || 0, max: 1, threshold: 0.05, label: (v: number) => v.toFixed(3) },
    { name: 'Área PRC Promedio', train: train?.weightedAvg?.prcArea || 0, test: test?.weightedAvg?.prcArea || 0, max: 1, threshold: 0.05, label: (v: number) => v.toFixed(3) },
    { name: 'Coef. Matthews (MCC)', train: train?.weightedAvg?.mcc || 0, test: test?.weightedAvg?.mcc || 0, max: 1, threshold: 0.05, label: (v: number) => v.toFixed(3) },
    { name: 'Medida F (F-Measure)', train: train?.weightedAvg?.fMeasure || 0, test: test?.weightedAvg?.fMeasure || 0, max: 1, threshold: 0.05, label: (v: number) => v.toFixed(3) },
    { name: 'Tiempo Construcción (s)', train: train?.buildTime || 0, test: test?.buildTime || 0, max: (train?.buildTime || 1) * 2, threshold: 1.0, label: (v: number) => `${v.toFixed(3)}s` },
    { name: 'Tiempo Validación (s)', train: train?.testTime || 0, test: test?.testTime || 0, max: (train?.testTime || 1) * 2, threshold: 1.0, label: (v: number) => `${v.toFixed(3)}s` },
  ];

  return (
    <div className="animate-in">
      <div className="grid-cols-auto" style={{ gap: '1.5rem' }}>
        {metrics.map(m => {
          const diff = m.test - m.train;
          const isBadChange = m.isInverse ? diff > m.threshold : diff < -m.threshold;
          const isGoodChange = m.isInverse ? diff < -m.threshold : diff > m.threshold;
          
          return (
            <div key={m.name} className="glass-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <Tooltip text={metricDefinitions[m.name] || ""} disabled={!isHelpMode}>
                  <h4 style={{
                    color: isHelpMode ? 'var(--accent-primary)' : 'var(--text-muted)',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    fontWeight: '600',
                    margin: 0,
                    cursor: isHelpMode ? 'help' : 'default',
                    borderBottom: isHelpMode ? '1px dashed var(--accent-primary)' : 'none'
                  }}>
                    {m.name}
                  </h4>
                </Tooltip>
                {isHelpMode && <HelpCircle size={14} style={{ color: 'var(--accent-primary)', opacity: 0.7 }} />}
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Entrenamiento</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{m.label ? m.label(m.train) : m.train.toFixed(2)}</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'var(--bg-dark)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((m.train / m.max) * 100, 100)}%`, height: '100%', background: 'var(--text-muted)' }}></div>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem', fontSize: '0.8rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Validación</span>
                  <span style={{ fontWeight: '700', color: 'var(--accent-primary)' }}>{m.label ? m.label(m.test) : m.test.toFixed(2)}</span>
                </div>
                <div style={{ width: '100%', height: '4px', background: 'var(--bg-dark)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min((m.test / m.max) * 100, 100)}%`, height: '100%', background: 'var(--accent-primary)' }}></div>
                </div>
              </div>

              {/* Gap Analysis */}
              <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-muted)' }}>Diferencia: </span>
                <span style={{
                  color: 'var(--text-main)',
                  fontWeight: '700'
                }}>
                  {m.label ? m.label(Math.abs(diff)) : Math.abs(diff).toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>


      {/* Comparison by Class (F-Measure) */}
      {train?.detailedAccuracy && test?.detailedAccuracy && (
        <div id="local-metrics-chart" className="glass-card" style={{ marginTop: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <Tooltip text={metricDefinitions['Medida F por Clase (Comparativa)']} disabled={!isHelpMode}>
              <h3 style={{
                color: isHelpMode ? 'var(--accent-primary)' : 'var(--text-main)',
                fontSize: '1rem',
                fontWeight: '600',
                margin: 0,
                cursor: isHelpMode ? 'help' : 'default',
                borderBottom: isHelpMode ? '1px dashed var(--accent-primary)' : 'none'
              }}>
                Medida F por Clase (Comparativa)
              </h3>
            </Tooltip>
            {isHelpMode && <HelpCircle size={16} style={{ color: 'var(--accent-primary)', opacity: 0.7 }} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {train.detailedAccuracy.map((tm, i) => {
              const testM = test.detailedAccuracy.find(m => m.className.trim() === tm.className.trim())
                || test.detailedAccuracy[i];

              if (!testM) return null;

              const trainVal = tm.fMeasure || 0;
              const testVal = testM.fMeasure || 0;

              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: 'minmax(140px, 1fr) 2fr', gap: '1.5rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: '500', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                    {tm.className}
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ flex: 1, height: '6px', background: 'var(--bg-dark)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${trainVal * 100}%`, height: '100%', background: 'var(--text-muted)' }}></div>
                      </div>
                      <span style={{ fontSize: '0.7rem', width: '40px', textAlign: 'right', color: 'var(--text-muted)' }}>{trainVal.toFixed(3)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ flex: 1, height: '6px', background: 'var(--bg-dark)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${testVal * 100}%`, height: '100%', background: 'var(--accent-primary)' }}></div>
                      </div>
                      <span style={{ fontSize: '0.7rem', width: '40px', textAlign: 'right', color: 'var(--accent-primary)', fontWeight: '700' }}>{testVal.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonView;
