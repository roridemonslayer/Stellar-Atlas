"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { StarData } from "@/lib/star-data";
import { Button } from "@/components/ui/button";
import { X, Trash2, BookMarked } from "lucide-react";

interface SavedStarsPanelProps {
  isOpen:         boolean;
  onClose:        () => void;
  savedStars:     StarData[];
  onSelectStar:   (star: StarData) => void;
  onRemoveStar:   (starId: string) => void;
}

// Tiny inline star color based on temperature — mirrors star-orb logic
function getStarGlow(temperature: number): string {
  if (temperature > 10000) return "#99ccff";
  if (temperature > 6000)  return "#ffcc00";
  if (temperature > 4000)  return "#ffb366";
  return "#ff6b4a";
}

export function SavedStarsPanel({
  isOpen,
  onClose,
  savedStars,
  onSelectStar,
  onRemoveStar,
}: SavedStarsPanelProps) {
  return (
    <>
      {/* ── Backdrop ──────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* ── Slide-in panel ────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            className="fixed top-0 right-0 h-full w-80 max-w-[90vw] z-40
                       bg-black/80 backdrop-blur-xl border-l border-white/10
                       flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-6 pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <BookMarked className="w-4 h-4 text-white/60" />
                <h2 className="text-sm font-semibold text-white">Saved Stars</h2>
                {savedStars.length > 0 && (
                  <span className="text-xs text-white/30">({savedStars.length})</span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-white/40 hover:text-white p-1.5 h-auto"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* ── Star list ─────────────────────────────────────── */}
            <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
              <AnimatePresence>
                {savedStars.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center h-64 text-center px-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
                      <BookMarked className="w-5 h-5 text-white/20" />
                    </div>
                    <p className="text-sm text-white/40">No saved stars yet</p>
                    <p className="text-xs text-white/20 mt-1">
                      Bookmark stars from their detail view
                    </p>
                  </motion.div>
                ) : (
                  savedStars.map((star, index) => {
                    const glow = getStarGlow(star.temperature);
                    return (
                      <motion.div
                        key={star.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.25, delay: index * 0.04 }}
                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl
                                   hover:bg-white/5 transition-colors duration-200 cursor-pointer"
                        onClick={() => onSelectStar(star)}
                      >
                        {/* Mini star orb */}
                        <div className="relative flex-shrink-0">
                          <div
                            className="w-8 h-8 rounded-full"
                            style={{
                              background: `radial-gradient(circle, white 0%, ${glow} 60%, ${glow}88 100%)`,
                              boxShadow: `0 0 10px ${glow}66`,
                            }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white truncate">{star.name}</p>
                          <p className="text-xs text-white/35">{star.type}</p>
                        </div>

                        {/* Delete button — appears on hover */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveStar(star.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity
                                     text-white/30 hover:text-red-400 p-1.5 h-auto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* ── Footer: clear all ───────────────────────────── */}
            {savedStars.length > 0 && (
              <div className="border-t border-white/10 px-5 py-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => savedStars.forEach((s) => onRemoveStar(s.id))}
                  className="w-full text-white/30 hover:text-red-400 text-xs"
                >
                  Clear all saved stars
                </Button>
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}