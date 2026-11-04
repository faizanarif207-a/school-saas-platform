"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { AnimatedCounter } from "./animated-counter";
import { LucideIcon } from "lucide-react";

type KpiCardProps = {
  label: string;
  value: number;
  format?: (n: number) => string;
  sub?: string;
  icon: LucideIcon;
  iconBg?: string;
  delay?: number;
  accentColor?: string; // top strip color
};

export function AnimatedKpiCard({
  label,
  value,
  format = (n) => Math.round(n).toString(),
  sub,
  icon: Icon,
  iconBg = "bg-primary/10",
  delay = 0,
  accentColor = "bg-primary",
}: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.2, ease: "easeOut" },
      }}
    >
      <Card className="relative overflow-hidden group cursor-default">
        {/* Animated top strip */}
        <motion.div
          className={`absolute top-0 left-0 right-0 h-1 ${accentColor}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: delay + 0.2, ease: "easeOut" }}
          style={{ transformOrigin: "left" }}
        />

        {/* Glow on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, rgba(0, 100, 200, 0.06), transparent 70%)",
          }}
        />

        <CardContent className="pt-5 relative">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                {label}
              </div>
              <div className="text-2xl font-bold mt-1.5 tracking-tight">
                <AnimatedCounter value={value} format={format} />
              </div>
              {sub && (
                <div className="text-xs text-muted-foreground mt-1">{sub}</div>
              )}
            </div>
            <motion.div
              className={`p-2 rounded-lg shrink-0 ${iconBg}`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Icon className="h-5 w-5" />
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
