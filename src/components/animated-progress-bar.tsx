"use client";

import { motion } from "framer-motion";

type AnimatedProgressProps = {
  value: number; // 0-100
  label?: string;
  valueSuffix?: string;
  delay?: number;
  color?: string;
  height?: string;
};

export function AnimatedProgressBar({
  value,
  label,
  valueSuffix = "",
  delay = 0,
  color = "bg-primary",
  height = "h-2",
}: AnimatedProgressProps) {
  const safeValue = Math.max(0, Math.min(100, value));
  
  return (
    <div>
      {label && (
        <div className="flex justify-between text-sm mb-1.5">
          <span className="font-medium">{label}</span>
          <span className="text-muted-foreground font-mono">
            {Math.round(safeValue)}{valueSuffix}
          </span>
        </div>
      )}
      <div className={`${height} rounded-full bg-muted overflow-hidden relative`}>
        <motion.div
          className={`h-full rounded-full ${color} relative`}
          initial={{ width: 0 }}
          whileInView={{ width: `${safeValue}%` }}
          viewport={{ once: true, margin: "-30px" }}
          transition={{
            duration: 1,
            delay,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              duration: 2,
              delay: delay + 0.5,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
