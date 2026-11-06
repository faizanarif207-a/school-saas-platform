"use client";

import { motion } from "framer-motion";

type DonutChartProps = {
  data: { label: string; value: number; color: string }[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
};

export function DonutChart({
  data,
  size = 180,
  thickness = 24,
  centerLabel = "",
  centerValue = "",
}: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  // Calculate cumulative offsets without mutation using reduce
  const segments = data.reduce<{ dash: number; offset: number; color: string; key: number }[]>(
    (acc, d, i) => {
      const dash = (d.value / total) * circumference;
      const offset = acc.length > 0 ? acc[acc.length - 1].offset + acc[acc.length - 1].dash : 0;
      return [...acc, { dash, offset, color: d.color, key: i }];
    },
    []
  );

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeOpacity="0.08" strokeWidth={thickness} />
        {segments.map((seg) => (
          <motion.circle
            key={seg.key}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={thickness}
            strokeLinecap="round"
            strokeDasharray={`${seg.dash} ${circumference}`}
            strokeDashoffset={-seg.offset}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: seg.key * 0.15, duration: 0.5, ease: "easeOut" }}
          />
        ))}
      </svg>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {centerValue && <div className="text-2xl font-bold">{centerValue}</div>}
          {centerLabel && <div className="text-xs text-muted-foreground mt-1">{centerLabel}</div>}
        </div>
      )}
    </div>
  );
}
