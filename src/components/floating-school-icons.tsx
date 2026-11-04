"use client";

import { motion } from "framer-motion";

type FloatingIconProps = {
  className?: string;
  delay?: number;
  duration?: number;
};

// Floating Graduation Cap
export function FloatingGradCap({ className = "", delay = 0, duration = 6 }: FloatingIconProps) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={{
        y: [0, -20, 0],
        rotate: [-5, 5, -5],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
        <path d="M30 8L55 20L30 32L5 20L30 8Z" fill="#0064C8" opacity="0.15" />
        <path d="M30 8L55 20L30 32L5 20L30 8Z" stroke="#0064C8" strokeWidth="2" fill="none" />
        <path d="M15 25V35C15 35 22 40 30 40C38 40 45 35 45 35V25" stroke="#0064C8" strokeWidth="2" fill="none" opacity="0.5" />
        <path d="M55 20V30" stroke="#0064C8" strokeWidth="2" opacity="0.5" />
        <circle cx="55" cy="32" r="3" fill="#F5A800" />
      </svg>
    </motion.div>
  );
}

// Floating Book
export function FloatingBook({ className = "", delay = 0, duration = 7 }: FloatingIconProps) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={{
        y: [0, 15, 0],
        rotate: [3, -3, 3],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
        <path d="M10 10H40V40H10V10Z" rx="3" fill="#0E9E56" opacity="0.1" />
        <rect x="10" y="10" width="30" height="30" rx="3" stroke="#0E9E56" strokeWidth="2" fill="none" />
        <line x1="25" y1="10" x2="25" y2="40" stroke="#0E9E56" strokeWidth="1.5" opacity="0.5" />
        <line x1="15" y1="18" x2="22" y2="18" stroke="#0E9E56" strokeWidth="1" opacity="0.4" />
        <line x1="15" y1="23" x2="22" y2="23" stroke="#0E9E56" strokeWidth="1" opacity="0.4" />
        <line x1="28" y1="18" x2="35" y2="18" stroke="#0E9E56" strokeWidth="1" opacity="0.4" />
        <line x1="28" y1="23" x2="35" y2="23" stroke="#0E9E56" strokeWidth="1" opacity="0.4" />
      </svg>
    </motion.div>
  );
}

// Floating Pencil
export function FloatingPencil({ className = "", delay = 0, duration = 8 }: FloatingIconProps) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={{
        y: [0, -12, 0],
        rotate: [-10, 10, -10],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="45" height="45" viewBox="0 0 45 45" fill="none">
        <path d="M10 35L35 10L40 15L15 40L10 35Z" fill="#F5A800" opacity="0.15" />
        <path d="M10 35L35 10L40 15L15 40L10 35Z" stroke="#F5A800" strokeWidth="2" fill="none" />
        <path d="M35 10L38 7L42 11L40 15" stroke="#F5A800" strokeWidth="2" fill="none" />
        <path d="M10 35L8 42L15 40" stroke="#F5A800" strokeWidth="2" fill="none" />
      </svg>
    </motion.div>
  );
}

// Floating Star
export function FloatingStar({ className = "", delay = 0, duration = 5 }: FloatingIconProps) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={{
        y: [0, -10, 0],
        scale: [1, 1.1, 1],
        opacity: [0.3, 0.6, 0.3],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <path d="M15 3L18 11L27 12L20 18L22 27L15 22L8 27L10 18L3 12L12 11L15 3Z" fill="#F5A800" opacity="0.4" />
      </svg>
    </motion.div>
  );
}

// Floating Apple (school apple)
export function FloatingApple({ className = "", delay = 0, duration = 6 }: FloatingIconProps) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={{
        y: [0, 10, 0],
        rotate: [5, -5, 5],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="35" height="35" viewBox="0 0 35 35" fill="none">
        <path d="M17 10C12 10 8 14 8 20C8 26 12 30 17 30C22 30 26 26 26 20C26 14 22 10 17 10Z" fill="#DC2626" opacity="0.15" />
        <path d="M17 10C12 10 8 14 8 20C8 26 12 30 17 30C22 30 26 26 26 20C26 14 22 10 17 10Z" stroke="#DC2626" strokeWidth="2" fill="none" />
        <path d="M17 10C17 7 18 5 20 5" stroke="#0E9E56" strokeWidth="2" fill="none" />
        <path d="M20 5C22 5 23 7 22 9" stroke="#0E9E56" strokeWidth="2" fill="none" />
      </svg>
    </motion.div>
  );
}

// Floating Ruler
export function FloatingRuler({ className = "", delay = 0, duration = 9 }: FloatingIconProps) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={{
        y: [0, -8, 0],
        rotate: [0, 8, 0],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <rect x="5" y="15" width="30" height="10" rx="2" fill="#0064C8" opacity="0.1" />
        <rect x="5" y="15" width="30" height="10" rx="2" stroke="#0064C8" strokeWidth="2" fill="none" />
        <line x1="10" y1="15" x2="10" y2="20" stroke="#0064C8" strokeWidth="1.5" />
        <line x1="15" y1="15" x2="15" y2="22" stroke="#0064C8" strokeWidth="1.5" />
        <line x1="20" y1="15" x2="20" y2="20" stroke="#0064C8" strokeWidth="1.5" />
        <line x1="25" y1="15" x2="25" y2="22" stroke="#0064C8" strokeWidth="1.5" />
        <line x1="30" y1="15" x2="30" y2="20" stroke="#0064C8" strokeWidth="1.5" />
      </svg>
    </motion.div>
  );
}

// Floating Clock
export function FloatingClock({ className = "", delay = 0, duration = 7 }: FloatingIconProps) {
  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={{
        y: [0, -15, 0],
        rotate: [-3, 3, -3],
      }}
      transition={{ duration, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      <svg width="35" height="35" viewBox="0 0 35 35" fill="none">
        <circle cx="17" cy="17" r="13" fill="#7C3AED" opacity="0.1" />
        <circle cx="17" cy="17" r="13" stroke="#7C3AED" strokeWidth="2" fill="none" />
        <path d="M17 10V17L22 20" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}

// Wrapper that places all floating icons
export function SchoolFloatingIcons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <FloatingGradCap className="top-10 right-10 w-16 h-16" delay={0} duration={6} />
      <FloatingBook className="top-32 left-10 w-12 h-12" delay={1} duration={7} />
      <FloatingPencil className="bottom-20 right-20 w-10 h-10" delay={0.5} duration={8} />
      <FloatingStar className="top-1/2 right-1/4 w-8 h-8" delay={2} duration={5} />
      <FloatingStar className="bottom-1/3 left-1/4 w-6 h-6" delay={1.5} duration={6} />
      <FloatingApple className="bottom-10 left-20 w-8 h-8" delay={3} duration={7} />
      <FloatingRuler className="top-1/3 right-10 w-10 h-10" delay={2.5} duration={9} />
      <FloatingClock className="top-20 left-1/3 w-8 h-8" delay={1} duration={7} />
    </div>
  );
}
