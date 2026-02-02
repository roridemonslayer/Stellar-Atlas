"use client";

import { motion } from "framer-motion";
import type { StarData } from "@/lib/star-data";

interface StarInfoCardProps {
  star: StarData;
  delay?: number;
}

export function StarInfoCard({ star, delay = 0 }: StarInfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className="bg-card/40 backdrop-blur-md border border-border/50 rounded-xl p-6 space-y-4"
    >
      {/* Star Name and Type */}
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-foreground tracking-tight">
          {star.name}
        </h2>
        <p className="text-sm text-muted-foreground">{star.type}</p>
      </div>

      {/* Temperature */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Temperature</span>
          <span className="text-sm font-medium text-foreground">
            {star.temperature.toLocaleString()}K
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (star.temperature / 50000) * 100)}%` }}
            transition={{ duration: 1.2, delay: delay + 0.2, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{
              background: star.temperature > 10000
                ? "linear-gradient(90deg, #99ccff, #3366cc)"
                : star.temperature > 6000
                ? "linear-gradient(90deg, #fff5cc, #ffffff)"
                : star.temperature > 4000
                ? "linear-gradient(90deg, #ffb366, #ffcc00)"
                : "linear-gradient(90deg, #ff6b4a, #ffb366)",
            }}
          />
        </div>
      </div>

      {/* Size Comparison */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Size (vs Sun)</span>
          <span className="text-sm font-medium text-foreground">
            {star.sizeRatio < 1
              ? `${(star.sizeRatio * 100).toFixed(1)}%`
              : `${star.sizeRatio.toFixed(1)}x`}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {/* Sun reference */}
          <div className="relative">
            <div className="w-4 h-4 rounded-full bg-star-yellow" />
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground">
              Sun
            </span>
          </div>
          {/* Star comparison */}
          <div className="relative">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.6, delay: delay + 0.4, ease: "easeOut" }}
              className="rounded-full"
              style={{
                width: Math.min(80, Math.max(8, star.sizeRatio * 16)),
                height: Math.min(80, Math.max(8, star.sizeRatio * 16)),
                background:
                  star.temperature > 10000
                    ? "radial-gradient(circle, #e6f0ff, #99ccff)"
                    : star.temperature > 6000
                    ? "radial-gradient(circle, #ffffff, #fff5cc)"
                    : star.temperature > 4000
                    ? "radial-gradient(circle, #fff5cc, #ffcc00)"
                    : "radial-gradient(circle, #ffb366, #ff6b4a)",
              }}
            />
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-muted-foreground whitespace-nowrap">
              {star.name.split(" ")[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Lifespan */}
      <div className="pt-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Lifespan</span>
          <span className="text-sm font-medium text-foreground">{star.lifespan}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function StarFactCard({ star, delay = 0 }: StarInfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className="bg-card/40 backdrop-blur-md border border-border/50 rounded-xl p-6"
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-accent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            Cosmic Insight
          </p>
          <p className="text-sm text-foreground/90 leading-relaxed italic">
            {`"${star.funFact}"`}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

export function StarLocationCard({ star, delay = 0 }: StarInfoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      className="bg-card/40 backdrop-blur-md border border-border/50 rounded-xl p-6 space-y-4"
    >
      <h3 className="text-lg font-medium text-foreground">Where It Lives</h3>

      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: delay + 0.1 }}
          className="flex justify-between items-center"
        >
          <span className="text-sm text-muted-foreground">Galaxy</span>
          <span className="text-sm font-medium text-foreground">
            {star.location.galaxy}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: delay + 0.2 }}
          className="flex justify-between items-center"
        >
          <span className="text-sm text-muted-foreground">Region</span>
          <span className="text-sm font-medium text-foreground">
            {star.location.region}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: delay + 0.3 }}
          className="flex justify-between items-center"
        >
          <span className="text-sm text-muted-foreground">Distance from Earth</span>
          <span className="text-sm font-medium text-foreground">
            {star.location.distanceFromEarth}
          </span>
        </motion.div>
      </div>

      {/* Distance visualization */}
      <div className="pt-2">
        <div className="relative h-2 bg-secondary/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: `${Math.min(100, (star.location.distanceLightYears / 100000) * 100)}%`,
            }}
            transition={{ duration: 1.5, delay: delay + 0.4, ease: "easeOut" }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary to-accent rounded-full"
          />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-star-blue rounded-full border border-background" />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-muted-foreground">Earth</span>
          <span className="text-[10px] text-muted-foreground">100k ly</span>
        </div>
      </div>
    </motion.div>
  );
}
