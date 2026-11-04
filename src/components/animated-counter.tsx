"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useSpring, animate } from "framer-motion";

type AnimatedCounterProps = {
  value: number;
  duration?: number;
  format?: (n: number) => string;
  className?: string;
};

export function AnimatedCounter({
  value,
  duration = 1.2,
  format = (n) => Math.round(n).toString(),
  className = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // smooth ease-out
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {format(display)}
    </span>
  );
}
