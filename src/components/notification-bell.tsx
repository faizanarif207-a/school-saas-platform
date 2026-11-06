// src/components/notification-bell.tsx
"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function NotificationBell({ role }: { role: string }) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch unread notice count based on role
    fetch("/api/notifications/count")
      .then(r => r.json())
      .then(data => setCount(data.count || 0))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading || count === 0) {
    return (
      <div className="relative p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
        <Bell className="h-5 w-5 text-muted-foreground" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      className="relative p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
    >
      <Bell className="h-5 w-5 text-foreground" />
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
        className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white px-1"
      >
        {count > 9 ? "9+" : count}
      </motion.div>
    </motion.div>
  );
}
