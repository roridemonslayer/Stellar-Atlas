"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import type { StarData } from "@/lib/star-data";
import { Compass, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConstellationViewProps {
  star: StarData;
  isOpen: boolean;
  onClose: () => void;
}

// Constellation patterns - simplified star positions for visual display
const CONSTELLATION_PATTERNS: Record<string, { x: number; y: number; magnitude: number }[]> = {
  "Orion": [
    { x: 50, y: 30, magnitude: 0.1 },   // Betelgeuse
    { x: 50, y: 85, magnitude: 0.2 },   // Rigel
    { x: 35, y: 45, magnitude: 1.7 },   // Bellatrix
    { x: 65, y: 45, magnitude: 2.2 },   // Alnitak
    { x: 58, y: 48, magnitude: 1.7 },   // Alnilam (belt)
    { x: 52, y: 50, magnitude: 1.8 },   // Mintaka (belt)
    { x: 45, y: 65, magnitude: 2.8 },   // Saiph
  ],
  "Centaurus": [
    { x: 40, y: 50, magnitude: 0.0 },   // Alpha Centauri
    { x: 60, y: 40, magnitude: 0.6 },   // Beta Centauri
    { x: 50, y: 65, magnitude: 2.3 },
    { x: 35, y: 70, magnitude: 2.9 },
    { x: 65, y: 55, magnitude: 3.1 },
  ],
  "Canis Major": [
    { x: 50, y: 50, magnitude: -1.5 },  // Sirius
    { x: 35, y: 35, magnitude: 1.5 },
    { x: 65, y: 35, magnitude: 1.8 },
    { x: 40, y: 65, magnitude: 3.0 },
    { x: 60, y: 70, magnitude: 4.1 },
  ],
  "Lyra": [
    { x: 50, y: 40, magnitude: 0.0 },   // Vega
    { x: 40, y: 60, magnitude: 3.2 },
    { x: 60, y: 60, magnitude: 3.2 },
    { x: 35, y: 75, magnitude: 4.3 },
    { x: 65, y: 75, magnitude: 4.3 },
  ],
  "Scorpius": [
    { x: 50, y: 30, magnitude: 1.0 },   // Antares
    { x: 40, y: 45, magnitude: 2.3 },
    { x: 45, y: 60, magnitude: 2.6 },
    { x: 55, y: 70, magnitude: 2.8 },
    { x: 65, y: 80, magnitude: 1.6 },
    { x: 75, y: 85, magnitude: 2.1 },
  ],
  "Boötes": [
    { x: 50, y: 50, magnitude: 0.0 },   // Arcturus
    { x: 40, y: 30, magnitude: 2.7 },
    { x: 55, y: 25, magnitude: 3.0 },
    { x: 65, y: 40, magnitude: 3.5 },
    { x: 60, y: 65, magnitude: 4.1 },
  ],
  "Ursa Minor": [
    { x: 50, y: 30, magnitude: 2.0 },   // Polaris
    { x: 40, y: 50, magnitude: 2.1 },
    { x: 30, y: 65, magnitude: 3.0 },
    { x: 35, y: 80, magnitude: 4.3 },
    { x: 50, y: 85, magnitude: 4.2 },
    { x: 60, y: 75, magnitude: 4.0 },
    { x: 55, y: 60, magnitude: 4.2 },
  ],
  "Taurus": [
    { x: 55, y: 45, magnitude: 0.9 },   // Aldebaran
    { x: 40, y: 30, magnitude: 3.0 },
    { x: 45, y: 35, magnitude: 3.4 },
    { x: 50, y: 32, magnitude: 3.6 },
    { x: 60, y: 55, magnitude: 2.9 },
    { x: 70, y: 40, magnitude: 1.7 },
  ],
  "Cygnus": [
    { x: 50, y: 30, magnitude: 1.3 },   // Deneb
    { x: 50, y: 50, magnitude: 2.2 },
    { x: 50, y: 70, magnitude: 2.5 },
    { x: 30, y: 50, magnitude: 2.5 },
    { x: 70, y: 50, magnitude: 2.9 },
  ],
  "Aquila": [
    { x: 50, y: 50, magnitude: 0.8 },   // Altair
    { x: 45, y: 45, magnitude: 2.7 },
    { x: 55, y: 45, magnitude: 2.7 },
    { x: 40, y: 65, magnitude: 3.4 },
    { x: 60, y: 65, magnitude: 3.7 },
  ],
  "Virgo": [
    { x: 50, y: 50, magnitude: 1.0 },   // Spica
    { x: 35, y: 35, magnitude: 2.7 },
    { x: 45, y: 30, magnitude: 3.4 },
    { x: 60, y: 40, magnitude: 2.8 },
    { x: 65, y: 60, magnitude: 3.9 },
  ],
  "Canis Minor": [
    { x: 50, y: 50, magnitude: 0.4 },   // Procyon
    { x: 65, y: 40, magnitude: 2.9 },
    { x: 40, y: 65, magnitude: 4.3 },
  ],
  "Aquarius": [
    { x: 45, y: 40, magnitude: 2.9 },
    { x: 55, y: 45, magnitude: 2.9 },
    { x: 50, y: 55, magnitude: 3.3 },
    { x: 40, y: 65, magnitude: 3.7 },
    { x: 60, y: 70, magnitude: 3.8 },
  ],
  "Pegasus": [
    { x: 30, y: 30, magnitude: 2.4 },
    { x: 70, y: 30, magnitude: 2.4 },
    { x: 70, y: 70, magnitude: 2.8 },
    { x: 30, y: 70, magnitude: 2.5 },
  ],
};

// Constellation line connections (indices into the pattern array)
const CONSTELLATION_LINES: Record<string, [number, number][]> = {
  "Orion": [[0, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1], [1, 0], [3, 6]],
  "Centaurus": [[0, 1], [1, 2], [2, 3], [3, 4], [4, 1]],
  "Canis Major": [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4]],
  "Lyra": [[0, 1], [0, 2], [1, 3], [2, 4], [3, 4]],
  "Scorpius": [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]],
  "Boötes": [[0, 1], [0, 2], [0, 3], [0, 4]],
  "Ursa Minor": [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1]],
  "Taurus": [[0, 1], [0, 2], [0, 3], [0, 4], [4, 5]],
  "Cygnus": [[0, 1], [1, 2], [1, 3], [1, 4]],
  "Aquila": [[0, 1], [0, 2], [1, 3], [2, 4]],
  "Virgo": [[0, 1], [1, 2], [2, 3], [3, 4]],
  "Canis Minor": [[0, 1], [0, 2]],
  "Aquarius": [[0, 1], [1, 2], [2, 3], [3, 4]],
  "Pegasus": [[0, 1], [1, 2], [2, 3], [3, 0]],
};

export function ConstellationView({ star, isOpen, onClose }: ConstellationViewProps) {
  const [animationComplete, setAnimationComplete] = useState(false);
  
  const constellation = star.location.constellation;
  const pattern = constellation ? CONSTELLATION_PATTERNS[constellation] : null;
  const lines = constellation ? CONSTELLATION_LINES[constellation] : null;

  useEffect(() => {
    if (isOpen) {
      setAnimationComplete(false);
      const timer = setTimeout(() => setAnimationComplete(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!constellation || !pattern) {
    return null;
  }

  // Find the star in the pattern
  const starIndex = constellation === "Orion" && star.name.includes("Betelgeuse") ? 0
    : constellation === "Orion" && star.name.includes("Rigel") ? 1
    : constellation === "Centaurus" && star.name.includes("Proxima") ? 0
    : constellation === "Canis Major" && star.name.includes("Sirius") ? 0
    : constellation === "Lyra" && star.name.includes("Vega") ? 0
    : constellation === "Scorpius" && star.name.includes("Antares") ? 0
    : constellation === "Boötes" && star.name.includes("Arcturus") ? 0
    : constellation === "Ursa Minor" && star.name.includes("Polaris") ? 0
    : constellation === "Taurus" && star.name.includes("Aldebaran") ? 0
    : constellation === "Cygnus" && star.name.includes("Deneb") ? 0
    : constellation === "Aquila" && star.name.includes("Altair") ? 0
    : constellation === "Virgo" && star.name.includes("Spica") ? 0
    : constellation === "Canis Minor" && star.name.includes("Procyon") ? 0
    : -1;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Constellation Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            onClick={onClose}
          >
            <div
              className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-8 max-w-2xl w-full relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
                    <Compass className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-white">{constellation}</h2>
                    <p className="text-sm text-white/50">Constellation</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white/40 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Star Chart */}
              <div className="relative bg-gradient-to-br from-[#0a0e1a] to-[#050810] rounded-xl p-8 border border-white/10">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-auto"
                  style={{ minHeight: "400px" }}
                >
                  {/* Connection lines */}
                  {lines && lines.map(([start, end], i) => {
                    const startPoint = pattern[start];
                    const endPoint = pattern[end];
                    return (
                      <motion.line
                        key={`line-${i}`}
                        x1={startPoint.x}
                        y1={startPoint.y}
                        x2={endPoint.x}
                        y2={endPoint.y}
                        stroke="rgba(150, 180, 255, 0.4)"
                        strokeWidth="0.15"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.6 }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                      />
                    );
                  })}

                  {/* Stars */}
                  {pattern.map((point, i) => {
                    const isTargetStar = i === starIndex;
                    const size = Math.max(0.5, 2 - point.magnitude * 0.3);
                    
                    return (
                      <g key={`star-${i}`}>
                        {/* Glow effect */}
                        <motion.circle
                          cx={point.x}
                          cy={point.y}
                          r={size * 2}
                          fill={isTargetStar ? "rgba(100, 200, 255, 0.3)" : "rgba(255, 255, 255, 0.1)"}
                          filter="blur(1px)"
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ 
                            scale: isTargetStar ? [1, 1.3, 1] : 1,
                            opacity: isTargetStar ? [0.3, 0.6, 0.3] : 0.2
                          }}
                          transition={{ 
                            duration: 2,
                            delay: 0.5 + i * 0.05,
                            repeat: isTargetStar ? Infinity : 0
                          }}
                        />
                        
                        {/* Star point */}
                        <motion.circle
                          cx={point.x}
                          cy={point.y}
                          r={size}
                          fill={isTargetStar ? "#64c8ff" : "white"}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.5, delay: 0.5 + i * 0.05 }}
                        />

                        {/* Target star indicator */}
                        {isTargetStar && (
                          <>
                            <motion.circle
                              cx={point.x}
                              cy={point.y}
                              r={size * 3}
                              fill="none"
                              stroke="#64c8ff"
                              strokeWidth="0.2"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                              transition={{ duration: 2, delay: 1, repeat: Infinity }}
                            />
                            <motion.text
                              x={point.x}
                              y={point.y - size - 2}
                              textAnchor="middle"
                              fill="white"
                              fontSize="3"
                              fontWeight="bold"
                              initial={{ opacity: 0, y: point.y }}
                              animate={{ opacity: 1, y: point.y - size - 2 }}
                              transition={{ duration: 0.5, delay: 1.5 }}
                            >
                              {star.name.split(" ")[0]}
                            </motion.text>
                          </>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Info overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: animationComplete ? 1 : 0 }}
                  className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg p-4 border border-white/10"
                >
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-white/50 mb-1">Your Star</p>
                      <p className="text-white font-semibold">{star.name}</p>
                    </div>
                    <div>
                      <p className="text-white/50 mb-1">Distance</p>
                      <p className="text-white font-semibold">{star.location.distanceFromEarth}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="mt-4 text-sm text-white/60 text-center"
              >
                The {constellation} constellation as seen from Earth. Your star is highlighted in blue.
              </motion.p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}