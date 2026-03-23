import React, { useState, useRef } from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children, disabled }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const shouldShow = visible && !disabled && text;

  const handleMouseEnter = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top - 8,
        left: rect.left + rect.width / 2
      });
    }
    setVisible(true);
  };

  return (
    <div 
      className="tooltip-container"
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setVisible(false)}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: !disabled ? 'help' : 'inherit' }}
    >
      {children}
      {shouldShow && (
        <div className="tooltip-box glass-card animate-in" style={{
          position: 'fixed',
          top: `${coords.top}px`,
          left: `${coords.left}px`,
          transform: 'translate(-50%, -100%)',
          zIndex: 9999,
          padding: '0.8rem 1.2rem',
          width: 'max-content',
          maxWidth: '300px',
          fontSize: '0.8rem',
          lineHeight: '1.6',
          background: 'rgba(15, 23, 42, 0.98)',
          color: '#f8fafc',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          pointerEvents: 'none',
          textAlign: 'center',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(12px)',
          animation: 'tooltip-in 0.2s ease-out forwards'
        }}>
          {text}
          <div style={{
            position: 'absolute',
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            borderWidth: '6px',
            borderStyle: 'solid',
            borderColor: 'rgba(15, 23, 42, 0.98) transparent transparent transparent'
          }}></div>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
