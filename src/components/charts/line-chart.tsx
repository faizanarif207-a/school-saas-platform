"use client";

import { motion } from "framer-motion";

type LineChartProps = {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  gradientId?: string;
  formatValue?: (n: number) => string;
};

export function LineChart({
  data,
  height = 200,
  color = "#0064C8",
  gradientId = "line-gradient",
  formatValue = (n) => n.toString(),
}: LineChartProps) {
  if (data.length === 0) return null;

  const width = 600;
  const padding = { top: 20, right: 20, bottom: 30, left: 50 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;

  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1 || 1)) * chartWidth;
    const y = padding.top + chartHeight - ((d.value - min) / range) * chartHeight;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: `${height}px` }}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = padding.top + chartHeight * t;
        const value = max - (range * t);
        return (
          <g key={i}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="currentColor" opacity="0.4">
              {formatValue(Math.round(value))}
            </text>
          </g>
        );
      })}
      {points.map((p, i) => (
        <text key={i} x={p.x} y={height - 8} textAnchor="middle" fontSize="10" fill="currentColor" opacity="0.4">
          {p.label}
        </text>
      ))}
      <motion.path d={areaPath} fill={`url(#${gradientId})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }} />
      <motion.path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeInOut" }} />
      {points.map((p, i) => (
        <motion.circle key={i} cx={p.x} cy={p.y} r="4" fill={color} stroke="white" strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5 + i * 0.08, duration: 0.3 }} />
      ))}
    </svg>
  );
}
