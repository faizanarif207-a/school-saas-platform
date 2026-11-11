// src/components/zb/parallax-image.tsx
"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

type ParallaxImageProps = {
  src: string;
  alt: string;
  className?: string;
  /** Speed of parallax effect. 0.1 = slow, 0.3 = medium, 0.5 = fast */
  speed?: number;
  /** Scale the image (Ken Burns effect) */
  scale?: number;
};

/**
 * Parallax image — moves slower than scroll, giving depth.
 * Combined with Ken Burns zoom effect for a cinematic feel.
 */
export function ParallaxImage({
  src,
  alt,
  className,
  speed = 0.3,
  scale = 1.15,
}: ParallaxImageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-15%", "15%"]);
  const scaleMotion = useTransform(scrollYProgress, [0, 0.5, 1], [scale, 1, scale]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        overflow: "hidden",
        position: "relative",
      }}
    >
      <motion.img
        src={src}
        alt={alt}
        style={{
          y,
          scale: scaleMotion,
          objectFit: "cover",
          width: "100%",
          height: "100%",
          willChange: "transform",
        }}
        loading="lazy"
      />
    </div>
  );
}
