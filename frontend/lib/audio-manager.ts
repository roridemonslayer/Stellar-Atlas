"use client";

/**
 * Stellar Atlas Audio Manager
 * 
 * Maps planet colors (hex) → unique ambient tones using the Web Audio API.
 * No external audio files needed — everything is synthesized.
 * 
 * Color → Sound mapping:
 *   R channel → base frequency (220–880 Hz)
 *   G channel → gain / volume (0.08–0.35)
 *   B channel → detune / pitch wobble (-100 to +100 cents)
 * 
 * Each tone is two layered oscillators (sine + triangle) with an LFO
 * on the gain for a slow "breathing" ambient feel.
 */

interface ActiveTone {
  oscillators: OscillatorNode[];
  gainNode: GainNode;
  lfoOsc: OscillatorNode;
  lfoGain: GainNode;
}

// Parse a hex color string into { r, g, b } (0–255)
function parseHexColor(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Map a 0–255 value linearly into a [min, max] range
function mapRange(value: number, min: number, max: number): number {
  return min + (value / 255) * (max - min);
}

export class AudioManager {
  private audioCtx: AudioContext | null = null;
  private activeTones: Map<string, ActiveTone> = new Map();

  // Lazily create the AudioContext on first use (browsers require user gesture)
  private getContext(): AudioContext {
    if (!this.audioCtx || this.audioCtx.state === "closed") {
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  /**
   * Start an ambient tone for a planet.
   * @param id   - unique key (e.g. planet name) to track this tone
   * @param color - hex color string like "#a8d5ba"
   */
  playPlanetTone(id: string, color: string): void {
    // Don't double-play
    if (this.activeTones.has(id)) return;

    const ctx = this.getContext();
    const { r, g, b } = parseHexColor(color);

    // --- Derive audio params from color channels ---
    const baseFreq  = mapRange(r, 220, 880);    // pitch range
    const baseGain  = mapRange(g, 0.08, 0.35);  // volume range
    const detune    = mapRange(b, -100, 100);    // wobble range

    // --- Main gain (controls overall volume, LFO targets this) ---
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(baseGain, ctx.currentTime);
    gainNode.connect(ctx.destination);

    // --- LFO: slow sine that gently pulses the gain ---
    const lfoOsc  = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfoOsc.frequency.value = 0.3;            // 0.3 Hz = one pulse every ~3 sec
    lfoGain.gain.value     = baseGain * 0.25; // LFO depth = 25% of base volume
    lfoOsc.connect(lfoGain);
    lfoGain.connect(gainNode.gain); // LFO modulates the gain value
    lfoOsc.start();

    // --- Oscillator 1: sine (the fundamental tone) ---
    const osc1 = ctx.createOscillator();
    osc1.type = "sine";
    osc1.frequency.value = baseFreq;
    osc1.detune.value    = detune;
    osc1.connect(gainNode);
    osc1.start();

    // --- Oscillator 2: triangle (adds harmonic warmth, quieter) ---
    const osc2       = ctx.createOscillator();
    const osc2Gain   = ctx.createGain();
    osc2.type        = "triangle";
    osc2.frequency.value = baseFreq * 2; // one octave up
    osc2.detune.value    = detune;
    osc2Gain.gain.value  = 0.3;          // blend at 30% volume
    osc2.connect(osc2Gain);
    osc2Gain.connect(gainNode);
    osc2.start();

    // --- Store references so we can stop later ---
    this.activeTones.set(id, {
      oscillators: [osc1, osc2],
      gainNode,
      lfoOsc,
      lfoGain,
    });
  }

  /**
   * Gracefully fade out and stop a planet's tone.
   */
  stopPlanetTone(id: string): void {
    const tone = this.activeTones.get(id);
    if (!tone || !this.audioCtx) return;

    const now = this.audioCtx.currentTime;

    // Fade out over 1.5 seconds instead of cutting abruptly
    tone.gainNode.gain.setValueAtTime(tone.gainNode.gain.value, now);
    tone.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

    // Stop everything after the fade
    setTimeout(() => {
      tone.oscillators.forEach((osc) => osc.stop());
      tone.lfoOsc.stop();
      this.activeTones.delete(id);
    }, 1600);
  }

  /**
   * Stop all currently playing tones.
   */
  stopAll(): void {
    this.activeTones.forEach((_, id) => this.stopPlanetTone(id));
  }

  /**
   * Clean up the AudioContext entirely (call on unmount).
   */
  dispose(): void {
    this.stopAll();
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
  }
}

// Singleton instance — import and use directly
export const audioManager = new AudioManager();

// Also export the class for type purposes if needed
export type { AudioManager };