"use client";

import { motion } from "framer-motion";
import type { StarData } from "@/lib/star-data";
import { Calendar, Sparkles } from "lucide-react";

interface DailyStarProps {
  star: StarData;
  onClick: () => void;
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

export function DailyStar({ star, onClick }: DailyStarProps) {
  const starColor = getStarColor(star.temperature);
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.6 }}
      className="w-full max-w-md"
    >
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Today's Star</span>
      </div>

      <motion.button
        onClick={onClick}
        className="w-full bg-card/40 backdrop-blur-md border border-border/50 rounded-xl p-6 text-left group relative overflow-hidden"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ duration: 0.3 }}
      >
        {/* Background glow effect */}
        <div
          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity"
          style={{
            background: `radial-gradient(circle at 30% 50%, ${starColor}40, transparent 60%)`,
          }}
        />

        <div className="relative flex items-center gap-5">
          {/* Mini star orb */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-14 h-14 rounded-full flex-shrink-0"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${starColor}, ${starColor}88)`,
              boxShadow: `0 0 20px ${starColor}66, 0 0 40px ${starColor}33`,
            }}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-3 h-3 text-accent" />
              <span className="text-xs text-muted-foreground">{formattedDate}</span>
            </div>
            <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {star.name}
            </h3>
            <p className="text-sm text-muted-foreground">{star.type}</p>
          </div>

          {/* Arrow indicator */}
          <motion.div
            className="flex-shrink-0"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <svg
              className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </motion.div>
        </div>

        {/* Bottom info */}
        <div className="relative mt-4 pt-4 border-t border-border/30 flex justify-between text-xs text-muted-foreground">
          <span>{star.location.galaxy}</span>
          <span>{star.location.distanceFromEarth}</span>
        </div>
      </motion.button>

      <p className="text-xs text-muted-foreground/60 text-center mt-3">
        A unique star revealed daily. Check back tomorrow for a new discovery.
      </p>
    </motion.div>
  );
}
