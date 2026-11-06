"use client";

import { motion } from "framer-motion";

type BarChartProps = {
  data: { label: string; value: number; color?: string }[];
  height?: number;
  formatValue?: (n: number) => string;
};

export function BarChart({
  data,
  height = 200,
  formatValue = (n) => n.toString(),
}: BarChartProps) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-full" style={{ minHeight: height }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100;
        const color = d.color || "#0064C8";
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <div className="text-xs font-mono font-semibold text-muted-foreground">{formatValue(d.value)}</div>
            <div className="w-full rounded-t-lg relative overflow-hidden flex-1 flex items-end" style={{ minHeight: "4px" }}>
              <motion.div
                className="w-full rounded-t-lg relative"
                style={{ background: `linear-gradient(to top, ${color}, ${color}80)` }}
                initial={{ height: 0 }}
                whileInView={{ height: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Shimmer */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ duration: 2, delay: i * 0.1 + 0.5, repeat: Infinity, repeatDelay: 4, ease: "easeInOut" }}
                />
              </motion.div>
            </div>
            <div className="text-xs text-muted-foreground text-center truncate w-full">{d.label}</div>
          </div>
        );
      })}
    </div>
  );
}
