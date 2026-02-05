"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import type { StarData } from "@/lib/star-data";
import { StarOrb } from "./star-orb";
import { StarInfoCard, StarFactCard, StarLocationCard } from "./star-info-card";
import { OrbitView } from "./orbit-view";
import { ConstellationView } from "./constellation-view";
import { AudioTestPanel } from "./audio-test-panel";
import { audioManager } from "@/lib/audio-manager";
import { Button } from "@/components/ui/button";
import { Star, Orbit, ArrowLeft, BookmarkPlus, BookmarkCheck, Compass, Volume2 } from "lucide-react";

interface StarViewProps {
  star: StarData;
  onBack: () => void;
  onSave: (star: StarData) => void;
  isSaved: boolean;
}

export function StarView({ star, onBack, onSave, isSaved }: StarViewProps) {
  const [showOrbitView, setShowOrbitView] = useState(false);
  const [showConstellation, setShowConstellation] = useState(false);
  const [showAudioTest, setShowAudioTest] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);

  // Initialize audio when component mounts
  useEffect(() => {
    const initAudio = async () => {
      const initialized = await audioManager.initialize();
      setAudioInitialized(initialized);
      if (!initialized) {
        console.log("Audio will initialize on first user interaction");
      }
    };
    initAudio();

    // Cleanup when component unmounts
    return () => {
      audioManager.stopAll();
    };
  }, []);

  // Handle switching to orbit view
  const handleOrbitViewToggle = async () => {
    if (!showOrbitView && !audioInitialized) {
      // Try to initialize audio when user clicks to orbit view
      const initialized = await audioManager.initialize();
      setAudioInitialized(initialized);
    }
    setShowOrbitView(!showOrbitView);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 min-h-screen"
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-20 px-6 py-4"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          <div className="flex items-center gap-2">
            {/* Audio Test Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAudioTest(true)}
              className="text-muted-foreground hover:text-foreground gap-2"
              title="Test Audio System"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden sm:inline">Audio</span>
            </Button>

            {/* Constellation Button - only show if star has constellation */}
            {star.location.constellation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConstellation(true)}
                className="text-muted-foreground hover:text-foreground gap-2"
                title={`View ${star.location.constellation} constellation`}
              >
                <Compass className="w-4 h-4" />
                <span className="hidden sm:inline">Constellation</span>
              </Button>
            )}

            {/* Orbit View Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOrbitViewToggle}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <Orbit className="w-4 h-4" />
              <span className="hidden sm:inline">
                {showOrbitView ? "Star View" : "Orbit View"}
              </span>
            </Button>

            {/* Save Button */}
            <Button
              variant={isSaved ? "secondary" : "ghost"}
              size="sm"
              onClick={() => onSave(star)}
              className={`gap-2 ${isSaved ? "text-accent" : "text-muted-foreground hover:text-foreground"}`}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <BookmarkPlus className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
            </Button>
          </div>
        </div>
      </motion.header>

      <div className="px-6 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            {showOrbitView ? (
              <motion.div
                key="orbit"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col items-center justify-center min-h-[60vh]"
              >
                <OrbitView star={star} />
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-12 text-center"
                >
                  <h2 className="text-2xl font-semibold text-foreground mb-2">
                    {star.name}
                  </h2>
                  <p className="text-muted-foreground">{star.type}</p>
                  {star.hasOrbitingBodies && (
                    <p className="text-sm text-muted-foreground/60 mt-2">
                      Click planets to hear their unique tones
                    </p>
                  )}
                  {!audioInitialized && star.hasOrbitingBodies && (
                    <p className="text-xs text-yellow-500/60 mt-1">
                      Click a planet to enable audio
                    </p>
                  )}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="star"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
              >
                {/* Star visualization */}
                <div className="flex justify-center mb-12">
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                      duration: 1.2,
                      ease: "easeOut",
                      delay: 0.2,
                    }}
                  >
                    <StarOrb
                      size={280}
                      temperature={star.temperature}
                      luminosity={star.luminosity}
                    />
                  </motion.div>
                </div>

                {/* Star name and type */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-center mb-12"
                >
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/50 rounded-full mb-4">
                    <Star className="w-3 h-3 text-accent" />
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {star.type}
                    </span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight text-balance">
                    {star.name}
                  </h1>
                  
                  {/* Constellation quick link */}
                  {star.location.constellation && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      onClick={() => setShowConstellation(true)}
                      className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-accent/10 hover:bg-accent/20 rounded-full transition-colors group"
                    >
                      <Compass className="w-4 h-4 text-accent group-hover:rotate-45 transition-transform" />
                      <span className="text-sm text-accent font-medium">
                        View in {star.location.constellation}
                      </span>
                    </motion.button>
                  )}
                </motion.div>

                {/* Info cards grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <StarInfoCard star={star} delay={0.5} />
                  <StarLocationCard star={star} delay={0.6} />
                  <div className="md:col-span-2 lg:col-span-1">
                    <StarFactCard star={star} delay={0.7} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Constellation View Modal */}
      <ConstellationView
        star={star}
        isOpen={showConstellation}
        onClose={() => setShowConstellation(false)}
      />

      {/* Audio Test Panel */}
      <AudioTestPanel
        isOpen={showAudioTest}
        onClose={() => setShowAudioTest(false)}
      />
    </motion.div>
  );
}