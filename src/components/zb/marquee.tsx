// src/components/zb/marquee.tsx
"use client";

import type { ReactNode } from "react";

type MarqueeProps = {
  children: ReactNode;
  speed?: number; // seconds for one full cycle (lower = faster)
  className?: string;
};

/**
 * Infinite horizontal marquee — used for client logos / testimonials strip.
 * Children are duplicated so the loop is seamless.
 */
export function Marquee({ children, speed = 30, className }: MarqueeProps) {
  return (
    <div
      className={className}
      style={{
        overflow: "hidden",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "max-content",
          animation: `zb-marquee ${speed}s linear infinite`,
          gap: "4rem",
          paddingRight: "4rem",
        }}
      >
        {/* First copy */}
        <div style={{ display: "flex", gap: "4rem", paddingRight: "4rem", alignItems: "center" }}>
          {children}
        </div>
        {/* Duplicate copy for seamless loop */}
        <div style={{ display: "flex", gap: "4rem", paddingRight: "4rem", alignItems: "center" }} aria-hidden>
          {children}
        </div>
      </div>
    </div>
  );
}
