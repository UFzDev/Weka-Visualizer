import React from 'react';
import { ClassMetrics } from '../utils/wekaParser';

interface MetricsGridProps {
  metrics: ClassMetrics[];
}

const MetricsGrid: React.FC<MetricsGridProps> = ({ metrics }) => {
  return (
    <div className="glass-card" style={{ padding: '0', overflowX: 'auto' }}>
      <table>
        <thead>
          <tr>
            <th>Clase</th>
            <th>TP Rate</th>
            <th>FP Rate</th>
            <th>Precisión</th>
            <th>Recall</th>
            <th>Medida F</th>
            <th>MCC</th>
            <th>ROC Area</th>
            <th>PRC Area</th>
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
