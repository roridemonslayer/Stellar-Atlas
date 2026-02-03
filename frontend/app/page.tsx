"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Starfield } from "@/components/stellar-atlas/starfield";
import { HomeScreen } from "@/components/stellar-atlas/home-screen";
import { StarView } from "@/components/stellar-atlas/star-view";
import { SavedStarsPanel } from "@/components/stellar-atlas/saved-stars-panel";
import { type StarData } from "@/lib/star-data";
import { fetchRandomStar, fetchDailyStar } from "@/lib/api-services";

type ViewState = "home" | "star" | "generating";

export default function StellarAtlas() {
  const [view, setView] = useState<ViewState>("home");
  const [currentStar, setCurrentStar] = useState<StarData | null>(null);
  const [savedStars, setSavedStars] = useState<StarData[]>([]);
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [ambientMode, setAmbientMode] = useState(false);
  const [dailyStar, setDailyStar] = useState<StarData | null>(null);

  // Load the daily star on mount.
  // fetchDailyStar already falls back to client-side generation internally,
  // so no try/catch or manual fallback is needed here.
  useEffect(() => {
    const loadDailyStar = async () => {
      const star = await fetchDailyStar();
      setDailyStar(star);
    };

    loadDailyStar();
  }, []);

  // Load saved stars from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("stellar-atlas-saved-stars");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedStars(parsed);
      } catch (e) {
        console.error("Failed to parse saved stars:", e);
      }
    }
  }, []);

  // Save stars to localStorage when they change
  useEffect(() => {
    if (savedStars.length > 0) {
      localStorage.setItem("stellar-atlas-saved-stars", JSON.stringify(savedStars));
    }
  }, [savedStars]);

  // fetchRandomStar already falls back to client-side generation internally,
  // so no try/catch or manual fallback is needed here either.
  const handleGenerateStar = useCallback(async () => {
    setView("generating");

    const newStar = await fetchRandomStar();

    setTimeout(() => {
      setCurrentStar(newStar);
      setView("star");
    }, 1500); // Keep the dramatic pause
  }, []);

  const handleSelectDailyStar = useCallback(() => {
    if (dailyStar) {
      setCurrentStar(dailyStar);
      setView("star");
    }
  }, [dailyStar]);

  const handleSelectSavedStar = useCallback((star: StarData) => {
    setCurrentStar(star);
    setShowSavedPanel(false);
    setView("star");
  }, []);

  const handleSaveStar = useCallback((star: StarData) => {
    setSavedStars((prev) => {
      const exists = prev.some((s) => s.id === star.id);
      if (exists) {
        // Remove if already saved
        return prev.filter((s) => s.id !== star.id);
      }
      // Add to saved stars
      return [...prev, star];
    });
  }, []);

  const handleRemoveStar = useCallback((starId: string) => {
    setSavedStars((prev) => prev.filter((s) => s.id !== starId));
  }, []);

  const handleBack = useCallback(() => {
    setView("home");
    setCurrentStar(null);
  }, []);

  const isCurrentStarSaved = currentStar
    ? savedStars.some((s) => s.id === currentStar.id)
    : false;

  return (
    <main className="relative min-h-screen bg-background overflow-hidden">
      {/* Starfield background */}
      <Starfield
        starCount={500}
        speed={ambientMode ? 0.2 : 0.5}
        ambient={ambientMode}
      />

      {/* Ambient overlay when enabled */}
      <AnimatePresence>
        {ambientMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="fixed inset-0 pointer-events-none z-[1]"
          >
            <div className="absolute inset-0 animate-breathe">
              <div
                className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20"
                style={{
                  background: "radial-gradient(circle, rgba(100, 130, 255, 0.3), transparent 70%)",
                  filter: "blur(60px)",
                }}
              />
              <div
                className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-15"
                style={{
                  background: "radial-gradient(circle, rgba(150, 100, 200, 0.3), transparent 70%)",
                  filter: "blur(50px)",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <AnimatePresence mode="wait">
        {view === "home" && dailyStar && (
          <HomeScreen
            key="home"
            onGenerateStar={handleGenerateStar}
            onOpenSavedStars={() => setShowSavedPanel(true)}
            savedStarsCount={savedStars.length}
            dailyStar={dailyStar}
            onSelectDailyStar={handleSelectDailyStar}
            ambientMode={ambientMode}
            onToggleAmbient={() => setAmbientMode(!ambientMode)}
            isGenerating={false}
          />
        )}

        {view === "generating" && (
          <motion.div
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-10 flex flex-col items-center justify-center"
          >
            {/* Traveling through space effect */}
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeIn" }}
              className="w-4 h-4 bg-star-white rounded-full"
              style={{
                boxShadow: "0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(200,210,255,0.5)",
              }}
            />
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 text-muted-foreground text-sm tracking-wider"
            >
              Traveling through space...
            </motion.p>
          </motion.div>
        )}

        {view === "star" && currentStar && (
          <StarView
            key="star"
            star={currentStar}
            onBack={handleBack}
            onSave={handleSaveStar}
            isSaved={isCurrentStarSaved}
          />
        )}
      </AnimatePresence>

      {/* Saved stars panel */}
      <SavedStarsPanel
        isOpen={showSavedPanel}
        onClose={() => setShowSavedPanel(false)}
        savedStars={savedStars}
        onSelectStar={handleSelectSavedStar}
        onRemoveStar={handleRemoveStar}
      />
    </main>
  );
}