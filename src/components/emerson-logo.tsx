"use client";

import { useTheme } from "next-themes";

type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  variant?: "light" | "dark";
  className?: string;
};

export function EmersonMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 64 90"
      className={className}
      aria-label="Emerson mark"
      role="img"
    >
      <rect x="0" y="0" width="64" height="26" fill="#F5A800" />
      <rect x="0" y="32" width="48" height="26" fill="#0E9E56" />
      <rect x="0" y="64" width="64" height="26" fill="#0064C8" />
    </svg>
  );
}

export function EmersonLogo({
  size = 32,
  showWordmark = true,
  variant,
  className = "",
}: LogoProps) {
  const { theme } = useTheme();
  // Auto-detect: if variant not specified, use theme
  const isDark = variant === "dark" || (theme === "dark" && !variant);
  const textColor = isDark ? "#F1F5F9" : "#1C232D";
  const wordmarkSize = size * 0.95;

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <EmersonMark size={size} />
      {showWordmark && (
        <span
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: wordmarkSize,
            fontWeight: 700,
            color: textColor,
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          Emerson
        </span>
      )}
    </div>
  );
}
