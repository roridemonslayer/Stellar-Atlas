"use client";

import { motion } from "framer-motion";
import { StarOrb } from "./star-orb";
import { DailyStar } from "./daily-star";
import type { StarData } from "@/lib/star-data";
import { Button } from "@/components/ui/button";
import { Sparkles, BookMarked, Volume2, VolumeX } from "lucide-react";
import {Starfield} from "@/components/stellar-atlas/starfield";

interface HomeScreenProps {
  onGenerateStar: () => void;
  onOpenSavedStars: () => void;
  savedStarsCount: number;
  dailyStar: StarData;
  onSelectDailyStar: () => void;
  ambientMode: boolean;
  onToggleAmbient: () => void;
  isGenerating: boolean;
}

export function HomeScreen({
  onGenerateStar,
  onOpenSavedStars,
  savedStarsCount,
  dailyStar,
  onSelectDailyStar,
  ambientMode,
  onToggleAmbient,
  isGenerating,
}: HomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-12"
    >
      {/* Header with controls */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-20 px-6 py-4"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground hidden sm:inline">
              Stellar Atlas
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleAmbient}
              className="text-muted-foreground hover:text-foreground gap-2"
              aria-label={ambientMode ? "Disable ambient mode" : "Enable ambient mode"}
            >
              {ambientMode ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Ambient</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenSavedStars}
              className="text-muted-foreground hover:text-foreground gap-2 relative"
            >
              <BookMarked className="w-4 h-4" />
              <span className="hidden sm:inline">Saved</span>
              {savedStarsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-accent-foreground text-[10px] rounded-full flex items-center justify-center">
                  {savedStarsCount > 9 ? "9+" : savedStarsCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="flex flex-col items-center max-w-xl text-center">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight mb-4 text-balance">
            Stellar Atlas
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto leading-relaxed">
            A quiet journey through the cosmos. Generate unique stars and explore the
            infinite beauty of the universe.
          </p>
        </motion.div>

        {/* Central star orb */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
          className="mb-10"
        >
          <StarOrb
            size={220}
            temperature={5778}
            luminosity={1}
            onClick={onGenerateStar}
            className="animate-float"
          />
        </motion.div>

        {/* Generate button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mb-12"
        >
          <Button
            onClick={onGenerateStar}
            disabled={isGenerating}
            size="lg"
            className="relative group px-8 py-6 text-lg bg-primary/90 hover:bg-primary text-primary-foreground rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                  />
                  Discovering...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate a Star
                </>
              )}
            </span>
            {/* Button glow effect */}
            <div className="absolute inset-0 rounded-full bg-primary/50 blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
          </Button>
        </motion.div>

        {/* Daily star section */}
        <DailyStar star={dailyStar} onClick={onSelectDailyStar} />
      </div>

      {/* Footer hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="fixed bottom-6 left-0 right-0 text-center"
      >
        <p className="text-xs text-muted-foreground/50">
          Click the star or button to begin your journey
        </p>
      </motion.div>
    </motion.div>
  );
}
