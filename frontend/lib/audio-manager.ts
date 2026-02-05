"use client";

/**
 * Stellar Atlas Audio Manager
 * 
 * Maps planet colors (hex) → unique ambient tones using the Web Audio API.
 * Handles browser autoplay policies and user interaction requirements.
 */

interface ActiveTone {
  oscillators: OscillatorNode[];
  gainNode: GainNode;
  lfoOsc: OscillatorNode;
  lfoGain: GainNode;
}

function parseHexColor(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function mapRange(value: number, min: number, max: number): number {
  return min + (value / 255) * (max - min);
}

export class AudioManager {
  private audioCtx: AudioContext | null = null;
  private activeTones: Map<string, ActiveTone> = new Map();
  private isClient: boolean = false;
  private isInitialized: boolean = false;

  constructor() {
    this.isClient = typeof window !== 'undefined';
  }

  /**
   * Initialize audio context - must be called from user interaction
   */
  async initialize(): Promise<boolean> {
    if (!this.isClient) return false;
    if (this.isInitialized && this.audioCtx?.state === "running") return true;

    try {
      if (!this.audioCtx || this.audioCtx.state === "closed") {
        this.audioCtx = new AudioContext();
      }
      
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }
      
      this.isInitialized = true;
      console.log("✅ Audio initialized successfully");
      return true;
    } catch (error) {
      console.error("Failed to initialize AudioContext:", error);
      return false;
    }
  }

  private getContext(): AudioContext | null {
    if (!this.isClient || !this.isInitialized) return null;
    
    if (this.audioCtx?.state === "suspended") {
      this.audioCtx.resume().catch(console.error);
    }
    
    return this.audioCtx;
  }

  /**
   * Play a tone for a planet based on its color
   * Automatically initializes audio context on first interaction
   */
  async playPlanetTone(id: string, color: string): Promise<boolean> {
    // Initialize on first play
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        console.warn("Audio context not initialized - user interaction required");
        return false;
      }
    }

    if (this.activeTones.has(id)) {
      console.log(`Tone already playing for ${id}`);
      return true;
    }

    const ctx = this.getContext();
    if (!ctx) {
      console.warn("Audio context not available");
      return false;
    }

    try {
      const { r, g, b } = parseHexColor(color);
      
      // Map colors to musical parameters
      const baseFreq = mapRange(r, 220, 880);        // A3 to A5
      const baseGain = mapRange(g, 0.05, 0.15);      // Lower volume
      const detune = mapRange(b, -50, 50);           // Subtle detuning

      // Create gain node with fade-in
      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(baseGain, ctx.currentTime + 0.5);
      gainNode.connect(ctx.destination);

      // Create LFO for subtle vibrato
      const lfoOsc = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfoOsc.frequency.value = 0.2; // Slow vibrato
      lfoGain.gain.value = baseGain * 0.2;
      lfoOsc.connect(lfoGain);
      lfoGain.connect(gainNode.gain);
      lfoOsc.start();

      // Main sine oscillator
      const osc1 = ctx.createOscillator();
      osc1.type = "sine";
      osc1.frequency.value = baseFreq;
      osc1.detune.value = detune;
      osc1.connect(gainNode);
      osc1.start();

      // Harmonic overtone
      const osc2 = ctx.createOscillator();
      const osc2Gain = ctx.createGain();
      osc2.type = "triangle";
      osc2.frequency.value = baseFreq * 2;
      osc2.detune.value = detune;
      osc2Gain.gain.value = 0.15;
      osc2.connect(osc2Gain);
      osc2Gain.connect(gainNode);
      osc2.start();

      this.activeTones.set(id, {
        oscillators: [osc1, osc2],
        gainNode,
        lfoOsc,
        lfoGain,
      });

      console.log(`🎵 Playing tone for ${id} at ${baseFreq.toFixed(0)}Hz`);
      return true;
    } catch (error) {
      console.error("Error playing planet tone:", error);
      return false;
    }
  }

  stopPlanetTone(id: string): void {
    const tone = this.activeTones.get(id);
    if (!tone || !this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      
      // Fade out smoothly
      tone.gainNode.gain.cancelScheduledValues(now);
      tone.gainNode.gain.setValueAtTime(tone.gainNode.gain.value, now);
      tone.gainNode.gain.linearRampToValueAtTime(0.001, now + 0.8);

      setTimeout(() => {
        try {
          tone.oscillators.forEach((osc) => osc.stop());
          tone.lfoOsc.stop();
          tone.gainNode.disconnect();
          tone.lfoGain.disconnect();
        } catch (e) {
          // Already stopped
        }
        this.activeTones.delete(id);
        console.log(`🔇 Stopped tone for ${id}`);
      }, 900);
    } catch (error) {
      console.error("Error stopping planet tone:", error);
      this.activeTones.delete(id);
    }
  }

  stopAll(): void {
    console.log("🔇 Stopping all tones");
    Array.from(this.activeTones.keys()).forEach((id) => this.stopPlanetTone(id));
  }

  dispose(): void {
    this.stopAll();
    if (this.audioCtx) {
      this.audioCtx.close().catch(console.error);
      this.audioCtx = null;
      this.isInitialized = false;
    }
  }

  /**
   * Check if audio is ready to play
   */
  isReady(): boolean {
    return this.isInitialized && this.audioCtx?.state === "running";
  }
}

// Singleton instance
export const audioManager = new AudioManager();