/**
 * Audio Manager for Stellar Atlas
 * Generates unique tones based on star temperature and planet colors
 * Maps stellar characteristics to musical frequencies and timbres
 */

class AudioManager {
  private audioContext: AudioContext | null = null;
  private activeTones: Map<string, { oscillator1: OscillatorNode; oscillator2: OscillatorNode; gainNode: GainNode; lfo: OscillatorNode }> = new Map();
  private masterGain: GainNode | null = null;
  private starTemperature: number = 5778; // Default to Sun's temperature

  /**
   * Initialize the audio context
   * Must be called after user interaction due to browser autoplay policies
   */
  async initialize(): Promise<boolean> {
    if (this.audioContext) {
      return true;
    }

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.gain.value = 0.3; // Overall volume
      this.masterGain.connect(this.audioContext.destination);
      
      // Resume context if suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      return true;
    } catch (error) {
      console.error('Failed to initialize audio:', error);
      return false;
    }
  }

  /**
   * Set the star's temperature for frequency calculations
   * Should be called when entering orbit view
   */
  setStarTemperature(temperature: number): void {
    this.starTemperature = temperature;
  }

  /**
   * Check if audio is ready
   */
  isReady(): boolean {
    return this.audioContext !== null && this.audioContext.state === 'running';
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 128, g: 128, b: 128 };
  }

  /**
   * Map star temperature (Kelvin) to base frequency
   * Sonification: hotter stars = higher pitch
   * 
   * Temperature ranges and their sounds:
   * - Red dwarfs (2500-3500K) -> Deep bass (110-165Hz) - A2 to E3
   * - Orange stars (3500-5000K) -> Low tones (165-220Hz) - E3 to A3
   * - Yellow stars (5000-6000K) -> Mid tones (220-330Hz) - A3 to E4
   * - White stars (6000-10000K) -> Higher tones (330-550Hz) - E4 to C#5
   * - Blue stars (10000-30000K) -> High tones (550-880Hz) - C#5 to A5
   */
  private temperatureToFrequency(temperature: number): number {
    const minTemp = 2500;  // Coolest red dwarfs
    const maxTemp = 50000; // Hottest blue stars
    const minFreq = 110;   // A2 - deep bass
    const maxFreq = 880;   // A5 - high treble
    
    // Clamp temperature to reasonable range
    const clampedTemp = Math.max(minTemp, Math.min(maxTemp, temperature));
    
    // Logarithmic scaling for more musical mapping
    // This makes the frequency changes more perceptually uniform
    const normalizedTemp = Math.log(clampedTemp - minTemp + 1) / Math.log(maxTemp - minTemp + 1);
    const frequency = minFreq * Math.pow(maxFreq / minFreq, normalizedTemp);
    
    return frequency;
  }

  /**
   * Map planet color to harmonic interval relative to star's base frequency
   * Creates consonant relationships between star and its planets
   * 
   * Uses color hue to select musical intervals:
   * - Each planet gets a harmonic relationship to the star
   * - Creates beautiful chord-like sounds when multiple planets play
   */
  private colorToSound(color: string, baseFrequency: number): { frequency: number; volume: number; detune: number } {
    const rgb = this.hexToRgb(color);
    
    // Use color hue to determine harmonic interval
    const hue = this.rgbToHue(rgb);
    
    // Map hue (0-360) to musical intervals (ratios)
    // These create harmonious tones relative to the star's base frequency
    const intervals = [
      1.0,    // Unison (0° - red)
      1.125,  // Major second (45°)
      1.25,   // Major third (90° - yellow-green)
      1.333,  // Perfect fourth (135°)
      1.5,    // Perfect fifth (180° - cyan)
      1.667,  // Major sixth (225°)
      1.875,  // Major seventh (270° - blue)
      2.0,    // Octave (315° - magenta)
    ];
    
    const intervalIndex = Math.floor((hue / 360) * intervals.length);
    const interval = intervals[intervalIndex];
    const frequency = baseFrequency * interval;
    
    // Map brightness (value) to volume
    // Brighter colors = louder sounds
    const brightness = Math.max(rgb.r, rgb.g, rgb.b) / 255;
    const volume = 0.04 + brightness * 0.08; // 0.04 - 0.12
    
    // Map saturation to detune for slight variations
    // More saturated colors = more detune (adds character)
    const saturation = this.rgbToSaturation(rgb);
    const detune = (saturation - 0.5) * 30; // -15 to +15 cents
    
    return { frequency, volume, detune };
  }

  /**
   * Convert RGB to hue (0-360 degrees)
   */
  private rgbToHue(rgb: { r: number; g: number; b: number }): number {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    if (delta === 0) return 0;
    
    let hue = 0;
    if (max === r) {
      hue = ((g - b) / delta) % 6;
    } else if (max === g) {
      hue = (b - r) / delta + 2;
    } else {
      hue = (r - g) / delta + 4;
    }
    
    hue = Math.round(hue * 60);
    if (hue < 0) hue += 360;
    
    return hue;
  }

  /**
   * Convert RGB to saturation (0-1)
   */
  private rgbToSaturation(rgb: { r: number; g: number; b: number }): number {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    if (max === 0) return 0;
    return (max - min) / max;
  }

  /**
   * Play a tone for a planet
   * Automatically calculates frequency based on star temperature and planet color
   */
  async playPlanetTone(planetId: string, planetColor: string): Promise<boolean> {
    if (!this.audioContext || !this.masterGain) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    // Stop existing tone for this planet
    this.stopPlanetTone(planetId);

    try {
      // Calculate base frequency from star temperature
      const baseFrequency = this.temperatureToFrequency(this.starTemperature);
      
      // Calculate planet's frequency based on its color
      const soundParams = this.colorToSound(planetColor, baseFrequency);

      // Create dual oscillators for richer sound
      const oscillator1 = this.audioContext!.createOscillator();
      const oscillator2 = this.audioContext!.createOscillator();
      const gainNode = this.audioContext!.createGain();
      
      // LFO for vibrato
      const lfo = this.audioContext!.createOscillator();
      const lfoGain = this.audioContext!.createGain();

      // Configure main oscillators
      oscillator1.type = 'sine';
      oscillator2.type = 'triangle';
      oscillator1.frequency.value = soundParams.frequency;
      oscillator2.frequency.value = soundParams.frequency;
      oscillator1.detune.value = soundParams.detune;
      oscillator2.detune.value = soundParams.detune + 5; // Slight detune between oscillators

      // Configure LFO (vibrato)
      lfo.frequency.value = 5; // 5Hz vibrato
      lfoGain.gain.value = 3; // Subtle vibrato depth
      
      // Connect LFO
      lfo.connect(lfoGain);
      lfoGain.connect(oscillator1.detune);
      lfoGain.connect(oscillator2.detune);

      // Set volume with envelope
      gainNode.gain.setValueAtTime(0, this.audioContext!.currentTime);
      gainNode.gain.linearRampToValueAtTime(
        soundParams.volume,
        this.audioContext!.currentTime + 0.1
      );

      // Connect oscillators
      oscillator1.connect(gainNode);
      oscillator2.connect(gainNode);
      gainNode.connect(this.masterGain!);

      // Start oscillators
      oscillator1.start();
      oscillator2.start();
      lfo.start();

      // Store for cleanup
      this.activeTones.set(planetId, { oscillator1, oscillator2, gainNode, lfo });

      return true;
    } catch (error) {
      console.error('Failed to play planet tone:', error);
      return false;
    }
  }

  /**
   * Stop a specific planet's tone
   */
  stopPlanetTone(planetId: string): void {
    const tone = this.activeTones.get(planetId);
    if (!tone || !this.audioContext) return;

    try {
      // Fade out
      const currentTime = this.audioContext.currentTime;
      tone.gainNode.gain.cancelScheduledValues(currentTime);
      tone.gainNode.gain.setValueAtTime(tone.gainNode.gain.value, currentTime);
      tone.gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.1);

      // Stop after fade
      setTimeout(() => {
        try {
          tone.oscillator1.stop();
          tone.oscillator2.stop();
          tone.lfo.stop();
          tone.oscillator1.disconnect();
          tone.oscillator2.disconnect();
          tone.lfo.disconnect();
          tone.gainNode.disconnect();
        } catch (e) {
          // Oscillator might already be stopped
        }
        this.activeTones.delete(planetId);
      }, 150);
    } catch (error) {
      console.error('Failed to stop planet tone:', error);
      this.activeTones.delete(planetId);
    }
  }

  /**
   * Stop all active tones
   */
  stopAll(): void {
    const planetIds = Array.from(this.activeTones.keys());
    planetIds.forEach(id => this.stopPlanetTone(id));
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Singleton instance
export const audioManager = new AudioManager();