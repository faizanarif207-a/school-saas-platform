"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

type ActivityItemProps = {
  icon: LucideIcon;
  iconBg: string;
  title: string;
  subtitle: string;
  time: string;
  index: number;
};

export function ActivityItem({
  icon: Icon,
  iconBg,
  title,
  subtitle,
  time,
  index,
}: ActivityItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.4,
        delay: 0.1 + index * 0.08,
        ease: "easeOut",
      }}
      whileHover={{ x: 4 }}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/40 transition-colors"
    >
      <div className={`p-2 rounded-lg shrink-0 ${iconBg}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        <div className="text-xs text-muted-foreground truncate">{subtitle}</div>
      </div>
      <div className="text-xs text-muted-foreground shrink-0 font-mono">
        {time}
      </div>
    </motion.div>
  );
}
