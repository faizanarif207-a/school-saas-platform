// src/components/zb/hero-words.tsx
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type HeroWordsProps = {
  text: string;
  className?: string;
};

/**
 * Splits the hero headline into words and animates each on scroll.
 * Each word fades up with a stagger.
 */
export function HeroWords({ text, className }: HeroWordsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Fade out as we scroll down
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.8], [0, -50]);

  const words = text.split(" ");

  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      className={className}
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.1 + i * 0.12,
            duration: 0.7,
            ease: [0.16, 1, 0.3, 1] as const,
          }}
          style={{ display: "inline-block", marginRight: "0.25em" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
