import React from 'react';
import { WekaParsedData } from '../utils/wekaParser';

interface ComparisonViewProps {
  train: WekaParsedData | null;
  test: WekaParsedData | null;
}

const ComparisonView: React.FC<ComparisonViewProps> = ({ train, test }) => {
  if (!train && !test) {
    return (
      <div className="glass-card flex-center animate-in" style={{ padding: '4rem', flexDirection: 'column', borderStyle: 'dashed' }}>
        <p style={{ color: 'var(--text-muted)' }}>Introduce datos en Entrenamiento y Validación para comparar.</p>
      </div>
    );
  }

  const metrics = [
    { name: 'Precisión Global (%)', train: train?.summary.correctlyClassified || 0, test: test?.summary.correctlyClassified || 0, max: 100 },
    { name: 'Índice Kappa', train: (train?.summary.kappa || 0) * 100, test: (test?.summary.kappa || 0) * 100, max: 100, label: (v: number) => (v/100).toFixed(3) },
    { name: 'Error Cuadrático (RMSE)', train: (train?.summary.rmse || 0) * 100, test: (test?.summary.rmse || 0) * 100, max: 100, isInverse: true, label: (v: number) => (v/100).toFixed(4) },
    { name: 'Tiempo Construcción (s)', train: (train?.buildTime || 0) * 100, test: (test?.buildTime || 0) * 100, max: 500, label: (v: number) => (v/100).toFixed(3) },
    { name: 'Tiempo Validación (s)', train: (test?.testTime || 0) * 100, test: (test?.testTime || 0) * 100, max: 500, label: (v: number) => (v/100).toFixed(3) },
  ];

  return (
    <div className="animate-in">
      <div className="grid-cols-auto" style={{ gap: '1.5rem' }}>
        {metrics.map(m => (
          <div key={m.name} className="glass-card">
            <h4 style={{ marginBottom: '1.25rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: '600' }}>{m.name}</h4>
            
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
            <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Diferencia Absoluta: </span>
              <span style={{ 
                color: Math.abs(m.train - m.test) > 10 ? 'var(--error)' : 'var(--success)', 
                fontWeight: '700' 
              }}>
                {(m.train - m.test).toFixed(2)}%
              </span>
            </div>
            {m.train - m.test > 15 && m.name.includes('Precisión') && (
              <div style={{ marginTop: '0.5rem', color: 'var(--error)', fontSize: '0.7rem', fontWeight: 'bold', textAlign: 'right' }}>
                Alerta: Posible Overfitting
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Comparison by Class (F-Measure) */}
      {train?.detailedAccuracy && test?.detailedAccuracy && (
        <div id="local-metrics-chart" className="glass-card" style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)', fontSize: '1rem', fontWeight: '600' }}>Medida F por Clase (Comparativa)</h3>
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
