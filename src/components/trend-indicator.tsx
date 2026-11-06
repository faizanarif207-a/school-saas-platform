"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

type TrendIndicatorProps = {
  value: number; // percentage, positive or negative
  label?: string;
  invertColor?: boolean; // if true, down is good (green)
};

export function TrendIndicator({ value, label, invertColor = false }: TrendIndicatorProps) {
  const isUp = value >= 0;
  const isGood = invertColor ? !isUp : isUp;
  const color = isGood ? "text-emerald-500" : "text-red-500";
  const Icon = isUp ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className={`inline-flex items-center gap-1 text-xs font-semibold ${color}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{isUp ? "+" : ""}{value}%</span>
      {label && <span className="text-muted-foreground font-normal ml-1">{label}</span>}
    </motion.div>
  );
}
