import React from 'react';

interface ConfusionMatrixProps {
  labels: string[];
  matrix: number[][];
}

const ConfusionMatrix: React.FC<ConfusionMatrixProps> = ({ labels, matrix }) => {
  const max = Math.max(...matrix.flat());

  return (
    <div className="glass-card animate-in" style={{ padding: '2rem', width: '100%', overflowX: 'auto' }}>
      <div style={{ position: 'relative', width: '100%' }}>
        {/* Label de Eje Superior (Real) */}
        <div style={{
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '1rem',
          width: '100%',
          paddingLeft: '140px' // Alineado con el inicio de las celdas
        }}>
          — Clase Real (Datos de Entrada) —
        </div>

        <div style={{ display: 'flex' }}>
          {/* Label de Eje Lateral (Predicho) */}
          <div style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            paddingRight: '1rem'
          }}>
            — Resultados Predichos —
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: `140px repeat(${labels.length}, minmax(80px, 1fr))`,
            gap: '1px',
            background: 'var(--border)',
            width: 'max-content',
            minWidth: '100%'
          }}>
            {/* Esquina superior izquierda */}
            <div style={{ background: 'var(--bg-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              PRED \ REAL
            </div>

            {/* Headers de Columnas */}
            {labels.map((label, i) => (
              <div key={i} style={{
                background: 'var(--bg-dark)',
                padding: '12px 8px',
                textAlign: 'center',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {label}
              </div>
            ))}

            {/* Filas */}
            {matrix.map((row, i) => (
              <React.Fragment key={i}>
                {/* Header de Fila */}
                <div style={{
                  background: 'var(--bg-dark)',
                  padding: '12px 16px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  color: 'var(--text-main)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  textAlign: 'right'
                }}>
                  {labels[i]}
                </div>

                {/* Celdas */}
                {row.map((val, j) => {
                  const intensity = max === 0 ? 0 : val / max;
                  const isDiagonal = i === j;

                  const bgColor = isDiagonal
                    ? `rgba(37, 99, 235, ${0.05 + intensity * 0.95})`
                    : val > 0 ? `rgba(220, 38, 38, ${0.05 + intensity * 0.4})` : 'var(--bg-card)';

                  const textColor = (isDiagonal && intensity > 0.5) ? 'white' : 'var(--text-main)';

                  return (
                    <div
                      key={j}
                      className="flex-center"
                      style={{
                        background: bgColor,
                        color: textColor,
                        height: '60px',
                        fontSize: '1rem',
                        fontWeight: isDiagonal ? '700' : '400',
                        transition: 'background 0.3s ease'
                      }}
                      title={`Real: ${labels[j]}, Predicho: ${labels[i]}`}
                    >
                      {val}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '2rem', fontSize: '0.75rem', color: 'var(--text-muted)', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '14px', height: '14px', background: 'var(--accent-primary)', borderRadius: '3px' }}></div>
          <span>Diagonal (Aciertos Correctos)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '14px', height: '14px', background: 'rgba(220, 38, 38, 0.4)', borderRadius: '3px' }}></div>
          <span>Celdas Rojas (Errores de Clasificación)</span>
        </div>
      </div>
    </div>
  );
};

export default ConfusionMatrix;
