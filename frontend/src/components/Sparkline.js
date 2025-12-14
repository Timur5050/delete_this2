import React from 'react';
import './Sparkline.css';

function Sparkline({ points = [], width = 80, height = 24, color = '#667eea', strokeWidth = 2 }) {
  if (!points || points.length === 0) return <svg width={width} height={height} />;

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const step = width / (points.length - 1 || 1);
  const coords = points.map((p, i) => {
    const x = i * step;
    const y = height - ((p - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const last = points[points.length - 1];

  return (
    <svg width={width} height={height} className="sparkline" aria-hidden>
      <polyline points={coords} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={width - 1} cy={height - ((last - min) / range) * height} r="2" fill={color} />
    </svg>
  );
}

export default Sparkline;
