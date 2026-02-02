"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import type { StarData, OrbitingBody } from "@/lib/star-data";

interface OrbitViewProps {
  star: StarData;
}

function getStarColor(temperature: number): string {
  if (temperature < 3500) return "#ff6b4a";
  if (temperature < 5000) return "#ffb366";
  if (temperature < 6000) return "#ffcc00";
  if (temperature < 7500) return "#fff5cc";
  if (temperature < 10000) return "#ffffff";
  if (temperature < 30000) return "#99ccff";
  return "#3366cc";
}

export function OrbitView({ star }: OrbitViewProps) {
  const [hoveredBody, setHoveredBody] = useState<OrbitingBody | null>(null);
  const starColor = getStarColor(star.temperature);

  // Generate orbit rings if the star has orbiting bodies
  const orbits = star.orbitingBodies.length > 0
    ? star.orbitingBodies
    : [
        { name: "Inner Zone", type: "asteroid" as const, orbitRadius: 60, color: "#666" },
        { name: "Habitable Zone", type: "planet" as const, orbitRadius: 100, color: "#4a9" },
        { name: "Outer Zone", type: "dwarf-planet" as const, orbitRadius: 140, color: "#88a" },
      ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="relative w-full aspect-square max-w-md mx-auto"
    >
      {/* Central star */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-12 h-12 rounded-full"
          style={{
            background: `radial-gradient(circle, ${starColor}, ${starColor}88)`,
            boxShadow: `0 0 30px ${starColor}88, 0 0 60px ${starColor}44`,
          }}
        />
      </div>

      {/* Orbit rings and bodies */}
      {orbits.map((body, index) => {
        const orbitDuration = 20 + index * 10;
        const size = body.orbitRadius * 2;

        return (
          <div
            key={body.name}
            className="absolute top-1/2 left-1/2"
            style={{
              width: size,
              height: size,
              marginLeft: -size / 2,
              marginTop: -size / 2,
            }}
          >
            {/* Orbit path */}
            <div
              className="absolute inset-0 rounded-full border border-border/30"
              style={{
                boxShadow: "inset 0 0 20px rgba(255,255,255,0.03)",
              }}
            />

            {/* Orbiting body */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: orbitDuration,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute inset-0"
              style={{ transformOrigin: "center center" }}
            >
              <motion.div
                className="absolute cursor-pointer"
                style={{
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
                onMouseEnter={() => setHoveredBody(body)}
                onMouseLeave={() => setHoveredBody(null)}
                whileHover={{ scale: 1.5 }}
              >
                <div
                  className="rounded-full"
                  style={{
                    width: body.type === "planet" ? 10 : body.type === "dwarf-planet" ? 6 : 4,
                    height: body.type === "planet" ? 10 : body.type === "dwarf-planet" ? 6 : 4,
                    background: body.color,
                    boxShadow: `0 0 10px ${body.color}66`,
                  }}
                />
              </motion.div>
            </motion.div>
          </div>
        );
      })}

      {/* Hover tooltip */}
      {hoveredBody && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card/80 backdrop-blur-md border border-border/50 rounded-lg px-4 py-2"
        >
          <p className="text-sm font-medium text-foreground">{hoveredBody.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{hoveredBody.type}</p>
        </motion.div>
      )}

      {/* Zone labels */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p className="text-xs text-muted-foreground">
          {star.hasOrbitingBodies
            ? `${star.orbitingBodies.length} orbiting ${star.orbitingBodies.length === 1 ? "body" : "bodies"}`
            : "Orbital zones"}
        </p>
      </div>
    </motion.div>
  );
}
