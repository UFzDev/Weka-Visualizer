import React from 'react';
import { ClassMetrics } from '../utils/wekaParser';
import Tooltip from './Tooltip';
import { HelpCircle } from 'lucide-react';

interface MetricsGridProps {
  metrics: ClassMetrics[];
  isHelpMode?: boolean;
}

const metricDefinitions: Record<string, string> = {
  'TP Rate': 'Tasa de Verdaderos Positivos: Es la proporción de casos reales de esta clase que el modelo logró detectar correctamente (Sensibilidad).',
  'FP Rate': 'Tasa de Falsos Positivos: Indica qué tan seguido el modelo se confunde y asigna esta clase a registros que pertenecen a otra categoría.',
  'Precisión': 'De todas las predicciones para esta clase, ¿qué porcentaje resultó ser correcto? Mide la fidelidad de la respuesta del modelo.',
  'Recall': 'De todos los objetos que realmente pertenecen a esta clase, ¿cuántos fue capaz de capturar el modelo? Mide la capacidad de cobertura del modelo.',
  'Medida F': 'Es un balance (media armónica) entre Precisión y Recall. Es el indicador más fiable para saber si el modelo es sólido para esta clase específica.',
  'MCC': 'Coeficiente Matthews: Una medida de calidad general que considera aciertos y errores en todas las categorías. 1 es perfecto, 0 es azar.',
  'ROC Area': 'Capacidad del modelo para distinguir esta clase de las demás. 1.0 es ideal, 0.5 significa que el modelo no tiene capacidad de discriminación.',
  'PRC Area': 'Área Precision-Recall: Mide la calidad de la predicción especialmente cuando las clases tienen cantidades muy diferentes de datos.'
};

const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics, isHelpMode }) => {
  return (
    <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Clase</th>
            {['TP Rate', 'FP Rate', 'Precisión', 'Recall', 'Medida F', 'MCC', 'ROC Area', 'PRC Area'].map(header => (
              <th key={header}>
                <Tooltip text={metricDefinitions[header] || ""} disabled={!isHelpMode}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.3rem',
                    cursor: isHelpMode ? 'help' : 'inherit',
                    color: isHelpMode ? 'var(--accent-primary)' : 'inherit',
                    borderBottom: isHelpMode ? '1px dashed var(--accent-primary)' : 'none'
                  }}>
                    {header}
                    {isHelpMode && <HelpCircle size={10} />}
                  </div>
                </Tooltip>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {metrics.map((m, i) => (
            <tr key={i}>
              <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{m.className}</td>
              <td>{m.tpRate.toFixed(3)}</td>
              <td>{m.fpRate.toFixed(3)}</td>
              <td>{m.precision.toFixed(3)}</td>
              <td>{m.recall.toFixed(3)}</td>
              <td style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{m.fMeasure.toFixed(3)}</td>
              <td>{m.mcc.toFixed(3)}</td>
              <td>{m.rocArea.toFixed(3)}</td>
              <td>{m.prcArea.toFixed(3)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MetricsGrid;
