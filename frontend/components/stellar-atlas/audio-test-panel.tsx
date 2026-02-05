"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, Play, Pause, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { audioManager } from "@/lib/audio-manager";

interface AudioTestPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEST_TONES = [
  { id: "low", name: "Low Tone", color: "#ff6b6b", freq: 220, description: "Red planet" },
  { id: "mid", name: "Mid Tone", color: "#4ecdc4", freq: 440, description: "Cyan planet" },
  { id: "high", name: "High Tone", color: "#95e1d3", freq: 880, description: "Green planet" },
  { id: "purple", name: "Purple Tone", color: "#c77dff", freq: 330, description: "Purple planet" },
];

export function AudioTestPanel({ isOpen, onClose }: AudioTestPanelProps) {
  const [audioStatus, setAudioStatus] = useState<"unknown" | "ready" | "blocked">("unknown");
  const [playingTones, setPlayingTones] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isOpen && !initialized) {
      checkAudioStatus();
    }
  }, [isOpen, initialized]);

  const checkAudioStatus = async () => {
    const ready = await audioManager.initialize();
    setInitialized(true);
    setAudioStatus(ready ? "ready" : "blocked");
  };

  const toggleTone = async (tone: typeof TEST_TONES[0]) => {
    if (!initialized) {
      await checkAudioStatus();
    }

    const isPlaying = playingTones.has(tone.id);
    
    if (isPlaying) {
      audioManager.stopPlanetTone(tone.id);
      setPlayingTones(prev => {
        const next = new Set(prev);
        next.delete(tone.id);
        return next;
      });
    } else {
      const success = await audioManager.playPlanetTone(tone.id, tone.color);
      if (success) {
        setPlayingTones(prev => new Set(prev).add(tone.id));
        setAudioStatus("ready");
      } else {
        setAudioStatus("blocked");
      }
    }
  };

  const stopAll = () => {
    audioManager.stopAll();
    setPlayingTones(new Set());
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-accent" />
                  <h3 className="text-lg font-semibold text-white">Audio Test</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white/40 hover:text-white"
                >
                  Close
                </Button>
              </div>

              {/* Status */}
              <div className="mb-6">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                  <span className="text-sm text-white/70">Audio Status</span>
                  <div className="flex items-center gap-2">
                    {audioStatus === "ready" && (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400 font-medium">Ready</span>
                      </>
                    )}
                    {audioStatus === "blocked" && (
                      <>
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span className="text-sm text-red-400 font-medium">Blocked</span>
                      </>
                    )}
                    {audioStatus === "unknown" && (
                      <span className="text-sm text-white/50">Click a tone to test</span>
                    )}
                  </div>
                </div>

                {audioStatus === "blocked" && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 text-xs text-red-400/80"
                  >
                    Audio blocked by browser. Try clicking a tone again, or check your browser settings.
                  </motion.p>
                )}
              </div>

              {/* Test Tones */}
              <div className="space-y-2 mb-4">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-3">
                  Test Tones
                </p>
                {TEST_TONES.map((tone) => {
                  const isPlaying = playingTones.has(tone.id);
                  return (
                    <motion.button
                      key={tone.id}
                      onClick={() => toggleTone(tone)}
                      className="w-full flex items-center justify-between p-3 rounded-lg border border-white/10 hover:border-white/20 transition-all group"
                      style={{
                        backgroundColor: isPlaying ? `${tone.color}20` : "rgba(255,255,255,0.03)",
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center"
                          style={{
                            background: `radial-gradient(circle, ${tone.color}, ${tone.color}88)`,
                            boxShadow: isPlaying ? `0 0 20px ${tone.color}66` : "none",
                          }}
                        >
                          {isPlaying ? (
                            <Pause className="w-4 h-4 text-white" />
                          ) : (
                            <Play className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-white">{tone.name}</p>
                          <p className="text-xs text-white/50">{tone.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-white/40">{tone.freq}Hz</p>
                        {isPlaying && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-xs text-accent"
                          >
                            Playing
                          </motion.p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Controls */}
              <div className="flex gap-2">
                <Button
                  onClick={stopAll}
                  disabled={playingTones.size === 0}
                  variant="secondary"
                  className="flex-1"
                  size="sm"
                >
                  <VolumeX className="w-4 h-4 mr-2" />
                  Stop All
                </Button>
                <Button
                  onClick={checkAudioStatus}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  Recheck Audio
                </Button>
              </div>

              {/* Help Text */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <p className="text-xs text-white/60 leading-relaxed">
                  <strong className="text-white/80">How it works:</strong> Click any tone to test. 
                  In orbit view, click planets to hear their unique sounds based on color. 
                  If audio is blocked, your browser requires interaction first.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}