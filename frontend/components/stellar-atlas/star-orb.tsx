"use client";

import { motion } from "framer-motion";

interface StarOrbProps {
  size?: number;
  color?: string;
  temperature?: number;
  luminosity?: number;
  className?: string;
  onClick?: () => void;
}

function getStarGradient(temperature: number): { inner: string; outer: string; glow: string } {
  // Temperature in Kelvin determines star color
  if (temperature < 3500) {
    // Red dwarf
    return {
      inner: "#ff6b4a",
      outer: "#8b2500",
      glow: "rgba(255, 100, 50, 0.6)",
    };
  } else if (temperature < 5000) {
    // Orange star
    return {
      inner: "#ffb366",
      outer: "#cc6600",
      glow: "rgba(255, 180, 100, 0.6)",
    };
  } else if (temperature < 6000) {
    // Yellow star (like our Sun)
    return {
      inner: "#fff5cc",
      outer: "#ffcc00",
      glow: "rgba(255, 220, 100, 0.6)",
    };
  } else if (temperature < 7500) {
    // Yellow-white star
    return {
      inner: "#fffef0",
      outer: "#fff5cc",
      glow: "rgba(255, 250, 200, 0.6)",
    };
  } else if (temperature < 10000) {
    // White star
    return {
      inner: "#ffffff",
      outer: "#e6f0ff",
      glow: "rgba(230, 240, 255, 0.6)",
    };
  } else if (temperature < 30000) {
    // Blue-white star
    return {
      inner: "#e6f0ff",
      outer: "#99ccff",
      glow: "rgba(150, 200, 255, 0.6)",
    };
  } else {
    // Blue giant / hot star
    return {
      inner: "#99ccff",
      outer: "#3366cc",
      glow: "rgba(100, 150, 255, 0.7)",
    };
  }
}

export function StarOrb({
  size = 200,
  temperature = 5778,
  luminosity = 1,
  className = "",
  onClick,
}: StarOrbProps) {
  const colors = getStarGradient(temperature);
  const pulseIntensity = Math.min(2, 0.5 + luminosity * 0.3);
  const pulseDuration = Math.max(2, 6 - luminosity * 0.5);

  return (
    <motion.div
      className={`relative cursor-pointer ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Outer glow layers */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
          filter: `blur(${size * 0.15}px)`,
        }}
        animate={{
          scale: [1, pulseIntensity, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: pulseDuration,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: `${size * 0.1}px`,
          background: `radial-gradient(circle, ${colors.glow} 0%, transparent 60%)`,
          filter: `blur(${size * 0.08}px)`,
        }}
        animate={{
          scale: [1.1, 1.3, 1.1],
          opacity: [0.6, 0.9, 0.6],
        }}
        transition={{
          duration: pulseDuration * 0.7,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3,
        }}
      />

      {/* Core star body */}
      <motion.div
        className="absolute rounded-full"
        style={{
          inset: `${size * 0.2}px`,
          background: `radial-gradient(circle at 30% 30%, ${colors.inner} 0%, ${colors.outer} 100%)`,
          boxShadow: `
            0 0 ${size * 0.1}px ${colors.glow},
            0 0 ${size * 0.2}px ${colors.glow},
            inset 0 0 ${size * 0.05}px rgba(255,255,255,0.3)
          `,
        }}
        animate={{
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: pulseDuration * 0.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Inner bright spot */}
      <div
        className="absolute rounded-full"
        style={{
          top: `${size * 0.28}px`,
          left: `${size * 0.28}px`,
          width: `${size * 0.15}px`,
          height: `${size * 0.15}px`,
          background: `radial-gradient(circle, rgba(255,255,255,0.8) 0%, transparent 70%)`,
          filter: "blur(2px)",
        }}
      />
    </motion.div>
  );
}
