import React, { useMemo } from 'react';

interface SparklineProps {
  data?: number[];
  color?: string;
  width?: number;
  height?: number;
}

const Sparkline: React.FC<SparklineProps> = ({
  data = [],
  color = 'var(--console-chart-gpu)',
  width = 72,
  height = 28
}) => {
  const points = useMemo(() => {
    if (!data.length) return '';
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    return data
      .map((value, index) => {
        const x =
          data.length === 1 ? width / 2 : (index / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
      })
      .join(' ');
  }, [data, height, width]);

  if (!data.length) {
    return <span style={{ display: 'inline-block', width, height }} />;
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', overflow: 'visible' }}
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={points}
      />
    </svg>
  );
};

export default Sparkline;
