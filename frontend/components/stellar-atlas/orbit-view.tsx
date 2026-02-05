"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { StarData, OrbitingBody } from "@/lib/star-data";
import { audioManager } from "@/lib/audio-manager";

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

// Planet pixel size by type
function getPlanetSize(type: OrbitingBody["type"]): number {
  switch (type) {
    case "planet": return 12;
    case "dwarf-planet": return 8;
    case "moon": return 5;
    case "asteroid": return 4;
  }
}

export function OrbitView({ star }: OrbitViewProps) {
  const [hoveredBody, setHoveredBody] = useState<OrbitingBody | null>(null);
  const [activeBody, setActiveBody] = useState<OrbitingBody | null>(null);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const starColor = getStarColor(star.temperature);

  // Use actual orbiting bodies from the star data
  const bodies = star.orbitingBodies || [];

  // Initialize audio on component mount
  useEffect(() => {
    const initAudio = async () => {
      const initialized = await audioManager.initialize();
      setAudioInitialized(initialized);
    };
    initAudio();
  }, []);

  // Audio lifecycle - play tone when a planet becomes active
  useEffect(() => {
    if (activeBody && audioInitialized) {
      audioManager.playPlanetTone(activeBody.name, activeBody.color);
    }
    return () => {
      if (activeBody) {
        audioManager.stopPlanetTone(activeBody.name);
      }
    };
  }, [activeBody, audioInitialized]);

  // Stop all tones when component unmounts
  useEffect(() => {
    return () => audioManager.stopAll();
  }, []);

  // Inject keyframes once
  useEffect(() => {
    const id = "stellar-orbit-keyframes";
    if (document.getElementById(id)) return;

    const css = `
      @keyframes orbit {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes counter-orbit {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to   { transform: translate(-50%, -50%) rotate(-360deg); }
      }
    `;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  }, []);

  // Click handler: toggle a planet's tone
  const handlePlanetClick = useCallback(async (e: React.MouseEvent, body: OrbitingBody) => {
    e.stopPropagation();
    
    // Initialize audio on first click if needed
    if (!audioInitialized) {
      const initialized = await audioManager.initialize();
      setAudioInitialized(initialized);
    }
    
    setActiveBody((prev) => (prev?.name === body.name ? null : body));
  }, [audioInitialized]);

  // Click on empty space: deactivate
  const handleBackdropClick = useCallback(() => {
    setActiveBody(null);
  }, []);

  // Show message if no orbiting bodies
  if (bodies.length === 0) {
    return (
      <div className="relative mx-auto flex flex-col items-center justify-center" style={{ width: 380, height: 380 }}>
        {/* Central star */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-14 h-14 rounded-full"
            style={{
              background: `radial-gradient(circle, white 0%, ${starColor} 50%, ${starColor}88 100%)`,
              boxShadow: `0 0 40px ${starColor}66, 0 0 80px ${starColor}33`,
            }}
          />
        </div>

        {/* No planets message */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center max-w-xs">
          <p className="text-sm text-white/60 mb-1">No Known Orbiting Bodies</p>
          <p className="text-xs text-white/30">
            {star.constellation ? `Located in ${star.constellation}` : "This star has no confirmed exoplanets"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onClick={handleBackdropClick}
      className="relative mx-auto flex items-center justify-center"
      style={{ width: 380, height: 380 }}
    >
      {/* Orbit rings */}
      {bodies.map((body) => {
        const size = body.orbitRadius * 2;
        return (
          <div
            key={`ring-${body.name}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: size,
              height: size,
              top: `calc(50% - ${size / 2}px)`,
              left: `calc(50% - ${size / 2}px)`,
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: activeBody?.name === body.name
                ? `0 0 12px ${body.color}44`
                : "none",
              transition: "box-shadow 0.4s ease",
            }}
          />
        );
      })}

      {/* Central star */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="w-14 h-14 rounded-full"
          style={{
            background: `radial-gradient(circle, white 0%, ${starColor} 50%, ${starColor}88 100%)`,
            boxShadow: `0 0 40px ${starColor}66, 0 0 80px ${starColor}33`,
          }}
        />
      </div>

      {/* Orbiting planets */}
      {bodies.map((body, index) => {
        const size = body.orbitRadius * 2;
        const planetSize = getPlanetSize(body.type);
        const orbitDuration = 25 + index * 8;
        const animDelay = -(index * (orbitDuration / bodies.length));

        const isActive = activeBody?.name === body.name;
        const isHovered = hoveredBody?.name === body.name;

        return (
          <div
            key={`orbit-${body.name}`}
            className="absolute"
            style={{
              width: size,
              height: size,
              top: `calc(50% - ${size / 2}px)`,
              left: `calc(50% - ${size / 2}px)`,
              animation: `orbit ${orbitDuration}s linear infinite`,
              animationDelay: `${animDelay}s`,
            }}
          >
            {/* Planet dot positioned at top of orbit ring, counter-rotates */}
            <div
              className="absolute cursor-pointer z-20"
              style={{
                top: 0,
                left: "50%",
                animation: `counter-orbit ${orbitDuration}s linear infinite`,
                animationDelay: `${animDelay}s`,
              }}
              onClick={(e) => handlePlanetClick(e, body)}
              onMouseEnter={() => setHoveredBody(body)}
              onMouseLeave={() => setHoveredBody(null)}
            >
              {/* Glow ring when active */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0.2, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    width: planetSize * 3.5,
                    height: planetSize * 3.5,
                    top: `calc(50% - ${(planetSize * 3.5) / 2}px)`,
                    left: `calc(50% - ${(planetSize * 3.5) / 2}px)`,
                    background: `radial-gradient(circle, ${body.color}88, transparent 70%)`,
                  }}
                />
              )}

              {/* Planet body */}
              <div
                className="rounded-full transition-transform duration-200"
                style={{
                  width: planetSize,
                  height: planetSize,
                  background: isHovered || isActive
                    ? `radial-gradient(circle at 35% 35%, white, ${body.color})`
                    : `radial-gradient(circle at 35% 35%, ${body.color}dd, ${body.color})`,
                  boxShadow: isActive
                    ? `0 0 14px ${body.color}, 0 0 28px ${body.color}66`
                    : `0 0 6px ${body.color}66`,
                  transform: isHovered ? "scale(1.4)" : "scale(1)",
                }}
              />
            </div>
          </div>
        );
      })}

      {/* Tooltip (hover or active) */}
      <AnimatePresence>
        {(hoveredBody || activeBody) && (
          <motion.div
            key={(hoveredBody || activeBody)!.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30
                       bg-black/70 backdrop-blur-md border border-white/10
                       rounded-xl px-5 py-3 text-center pointer-events-none"
          >
            <div className="flex items-center justify-center gap-2 mb-1">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: (hoveredBody || activeBody)!.color }}
              />
              <p className="text-sm font-semibold text-white">
                {(hoveredBody || activeBody)!.name}
              </p>
            </div>
            <p className="text-xs text-white/50 capitalize">
              {(hoveredBody || activeBody)!.type}
              {activeBody?.name === (hoveredBody || activeBody)!.name
                ? " • playing"
                : " • click to play"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body count label */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p className="text-xs text-white/30">
          {bodies.length} confirmed {bodies.length === 1 ? "exoplanet" : "exoplanets"}
        </p>
      </div>
    </div>
  );
}