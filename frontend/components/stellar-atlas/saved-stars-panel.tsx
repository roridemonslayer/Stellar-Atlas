"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { StarData } from "@/lib/star-data";
import { X } from "lucide-react";

interface SavedStarsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  savedStars: StarData[];
  onSelectStar: (star: StarData) => void;
  onRemoveStar: (starId: string) => void;
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

export function SavedStarsPanel({
  isOpen,
  onClose,
  savedStars,
  onSelectStar,
  onRemoveStar,
}: SavedStarsPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-card/90 backdrop-blur-lg border-l border-border/50 z-50 overflow-hidden"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/30">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Saved Stars</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {savedStars.length} {savedStars.length === 1 ? "star" : "stars"} in your
                    collection
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
                  aria-label="Close panel"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Stars list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {savedStars.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center px-4">
                    <div className="w-16 h-16 rounded-full bg-secondary/30 flex items-center justify-center mb-4">
                      <svg
                        className="w-8 h-8 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                        />
                      </svg>
                    </div>
                    <p className="text-muted-foreground">No saved stars yet</p>
                    <p className="text-sm text-muted-foreground/70 mt-1">
                      Generate a star and save it to your collection
                    </p>
                  </div>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {savedStars.map((star, index) => (
                      <motion.div
                        key={star.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="group relative bg-secondary/30 hover:bg-secondary/50 border border-border/30 rounded-xl p-4 cursor-pointer transition-colors"
                        onClick={() => onSelectStar(star)}
                      >
                        <div className="flex items-center gap-4">
                          {/* Star preview */}
                          <div
                            className="w-10 h-10 rounded-full flex-shrink-0"
                            style={{
                              background: `radial-gradient(circle, ${getStarColor(star.temperature)}, ${getStarColor(star.temperature)}88)`,
                              boxShadow: `0 0 15px ${getStarColor(star.temperature)}44`,
                            }}
                          />

                          {/* Star info */}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{star.name}</p>
                            <p className="text-xs text-muted-foreground">{star.type}</p>
                          </div>

                          {/* Remove button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveStar(star.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-destructive/20 transition-all"
                            aria-label={`Remove ${star.name} from saved stars`}
                          >
                            <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>

                        {/* Additional info */}
                        <div className="mt-3 pt-3 border-t border-border/20 flex justify-between text-xs text-muted-foreground">
                          <span>{star.location.galaxy}</span>
                          <span>{star.location.distanceFromEarth}</span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
