// src/components/zb/animated-counter.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

type AnimatedCounterProps = {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number; // ms
  className?: string;
};

/**
 * Counts up from 0 to `value` when scrolled into view.
 * Used for the stats section (15+ years, 50K+ learners, etc.)
 */
export function AnimatedCounter({
  value,
  suffix = "",
  prefix = "",
  duration = 1800,
  className,
}: AnimatedCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let startTime: number | null = null;
    let frame: number;

    const animate = (now: number) => {
      if (startTime === null) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic for natural deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [isInView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display.toLocaleString()}
      {suffix}
    </span>
  );
}
