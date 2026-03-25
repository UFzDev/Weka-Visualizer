import React, { useEffect } from 'react';
import { X, BookOpen, MousePointer2, Copy, Play } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      padding: '1rem'
    }} onClick={onClose}>
      <div 
        className="glass-card animate-in"
        style={{
          width: '100%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          padding: '2.5rem',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '50%',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseOver={e => (e.currentTarget.style.backgroundColor = 'rgba(255, 0, 0, 0.1)')}
          onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <X size={20} />
        </button>

        <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <div style={{ 
            display: 'inline-flex', 
            padding: '1rem', 
            borderRadius: '1.25rem', 
            background: 'rgba(124, 58, 237, 0.15)',
            color: 'var(--accent-primary)',
            marginBottom: '1rem'
          }}>
            <BookOpen size={32} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem', color: '#fff' }}>Guía de Uso: Visualizador Weka Professional</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Sigue estos pasos para extraer la información correctamente desde Weka.</p>
        </header>

        <div style={{ display: 'grid', gap: '2rem' }}>
          {/* Paso 1 */}
          <section style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ 
              minWidth: '2.5rem', 
              height: '2.5rem', 
              borderRadius: '50%', 
              background: 'var(--accent-primary)', 
              color: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1.1rem'
            }}>1</div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '600' }}>Inicia Weka Explorer</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Abre el software Weka y selecciona la opción <strong style={{ color: '#fff' }}>"Explorer"</strong>. 
                Carga tu archivo de datos (.arff o .csv) en la pestaña <strong style={{ color: '#fff' }}>"Preprocess"</strong> mediante el botón "Open file...".
              </p>
            </div>
          </section>

          {/* Paso 2 */}
          <section style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ 
              minWidth: '2.5rem', 
              height: '2.5rem', 
              borderRadius: '50%', 
              background: 'var(--accent-primary)', 
              color: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1.1rem'
            }}>2</div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '600' }}>Navega a la pestaña de Clasificación</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Haz clic en la pestaña <strong style={{ color: '#fff' }}><MousePointer2 size={14} style={{ display: 'inline' }} /> "Classify"</strong> ubicada en la parte superior.
                Aquí es donde configurarás el algoritmo (ej: J48, RandomForest, NaiveBayes).
              </p>
            </div>
          </section>

          {/* Paso 3 */}
          <section style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ 
              minWidth: '2.5rem', 
              height: '2.5rem', 
              borderRadius: '50%', 
              background: 'var(--accent-primary)', 
              color: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1.1rem'
            }}>3</div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '600' }}>Configura y Ejecuta</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Selecciona tu algoritmo en el botón "Choose". En <strong style={{ color: '#fff' }}>"Test options"</strong>, elige el método de evaluación (Cross-validation es el más común). 
                Presiona <strong style={{ color: 'var(--success)' }}><Play size={14} style={{ display: 'inline' }} /> "Start"</strong>.
              </p>
            </div>
          </section>

          {/* Paso 4 */}
          <section style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ 
              minWidth: '2.5rem', 
              height: '2.5rem', 
              borderRadius: '50%', 
              background: 'var(--accent-primary)', 
              color: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1.1rem'
            }}>4</div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '600' }}>Copia el "Classifier Output"</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                En el panel derecho llamado <strong style={{ color: '#fff' }}>"Classifier output"</strong> aparecerá mucho texto. 
                Haz clic derecho sobre él y selecciona <strong style={{ color: '#fff' }}>"Select all"</strong>, luego presiona <strong style={{ color: '#fff' }}><Copy size={14} style={{ display: 'inline' }} /> Ctrl+C</strong> para copiarlo todo.
              </p>
            </div>
          </section>

            {/* Paso 5 */}
          <section style={{ display: 'flex', gap: '1.5rem' }}>
            <div style={{ 
              minWidth: '2.5rem', 
              height: '2.5rem', 
              borderRadius: '50%', 
              background: 'var(--accent-primary)', 
              color: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '1.1rem'
            }}>5</div>
            <div>
              <h4 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.1rem', fontWeight: '600' }}>Pega el texto aquí</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Regresa a esta aplicación. Asegúrate de estar en la pestaña correcta (<strong style={{ color: '#fff' }}>Entrenamiento</strong> o <strong style={{ color: '#fff' }}>Validación</strong>) 
                y pega el texto copiado directamente en el cuadro de texto central. ¡Las gráficas se generarán al instante!
              </p>
            </div>
          </section>

          {/* Glosario de Métricas de Error */}
          <section style={{ 
            marginTop: '1rem', 
            padding: '1.5rem', 
            borderRadius: '1rem', 
            background: 'rgba(124, 58, 237, 0.05)',
            border: '1px solid rgba(124, 58, 237, 0.2)'
          }}>
            <h4 style={{ color: 'var(--accent-primary)', marginBottom: '0.75rem', fontSize: '1rem', fontWeight: '700' }}>
              Métricas de Error (RAE y RRSE)
            </h4>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>
                <strong style={{ color: '#fff' }}>RAE (Error Absoluto Relativo):</strong> Compara el error de tu modelo con un predictor trivial (la media). Si es cercano al 0%, tu modelo es excelente.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>
                <strong style={{ color: '#fff' }}>RRSE (Error Cuadrático Relativo):</strong> Similar al RAE pero más estricto con los errores grandes. Ayuda a identificar modelos con fallos críticos.
              </p>
            </div>
          </section>
        </div>

        <div style={{ 
          marginTop: '3.5rem', 
          padding: '1.5rem', 
          borderRadius: '1rem', 
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          textAlign: 'center'
        }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
            <strong style={{ color: 'var(--accent-primary)' }}>Tip Pro:</strong> Puedes generar informes profesionales con el botón <strong style={{ color: '#fff' }}>"Reporte Excel"</strong> 
            y activar el <strong style={{ color: '#fff' }}>"Modo Ayuda"</strong> para obtener explicaciones detalladas al pasar el mouse sobre cualquier métrica.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
