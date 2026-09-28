/**
 * 8-Bit Web Audio API Synthesizer Engine
 * Produces authentic chiptune sound effects & background procedural BGM.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;
  public isBgmEnabled: boolean = false;
  public sfxVolume: number = 0.5;
  public bgmVolume: number = 0.18;
  private bgmInterval: number | null = null;
  private bgmStep: number = 0;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTone(freq: number, type: OscillatorType, duration: number, gainVal = 0.1, delay = 0) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const ctx = this.ctx;
      const startTime = ctx.currentTime + delay;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      const effectiveGain = gainVal * this.sfxVolume;
      gain.gain.setValueAtTime(effectiveGain, startTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration);
    } catch {
      // Audio may fail if not interacted yet
    }
  }

  // SFX Presets
  public build() {
    this.playTone(330, 'square', 0.06, 0.08, 0);
    this.playTone(550, 'square', 0.1, 0.09, 0.05);
  }

  public demolish() {
    this.playTone(180, 'sawtooth', 0.08, 0.12, 0);
    this.playTone(90, 'sawtooth', 0.15, 0.15, 0.06);
  }

  public coin() {
    this.playTone(659.25, 'triangle', 0.07, 0.1, 0);
    this.playTone(987.77, 'triangle', 0.14, 0.12, 0.06);
  }

  public feed() {
    this.playTone(392, 'sine', 0.08, 0.09, 0);
    this.playTone(523.25, 'sine', 0.1, 0.1, 0.07);
    this.playTone(659.25, 'sine', 0.15, 0.1, 0.14);
  }

  public error() {
    this.playTone(130, 'sawtooth', 0.12, 0.14, 0);
    this.playTone(110, 'sawtooth', 0.2, 0.14, 0.1);
  }

  public animalRoar() {
    this.playTone(110, 'sawtooth', 0.15, 0.15, 0);
    this.playTone(85, 'triangle', 0.25, 0.2, 0.05);
  }

  public animalSqueak() {
    this.playTone(880, 'sine', 0.05, 0.08, 0);
    this.playTone(1320, 'sine', 0.08, 0.09, 0.04);
  }

  public animalTrumpet() {
    this.playTone(440, 'sawtooth', 0.12, 0.12, 0);
    this.playTone(587.33, 'sawtooth', 0.15, 0.15, 0.08);
    this.playTone(880, 'sawtooth', 0.22, 0.15, 0.18);
  }

  public animalHowl() {
    this.playTone(260, 'sine', 0.2, 0.1, 0);
    this.playTone(392, 'sine', 0.25, 0.12, 0.12);
    this.playTone(523, 'sine', 0.35, 0.14, 0.25);
  }

  public animalBird() {
    this.playTone(1200, 'triangle', 0.04, 0.08, 0);
    this.playTone(1600, 'triangle', 0.06, 0.08, 0.05);
    this.playTone(1400, 'triangle', 0.08, 0.08, 0.1);
  }

  public animalSplash() {
    this.playTone(320, 'sawtooth', 0.06, 0.08, 0);
    this.playTone(480, 'sine', 0.08, 0.08, 0.04);
    this.playTone(220, 'triangle', 0.12, 0.1, 0.08);
  }

  public milestone() {
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99];
    notes.forEach((freq, idx) => {
      this.playTone(freq, 'triangle', 0.18, 0.15, idx * 0.08);
    });
  }

  public guestHappy() {
    this.playTone(520, 'sine', 0.05, 0.05, 0);
    this.playTone(660, 'sine', 0.07, 0.05, 0.05);
  }

  // Chiptune Theme Park BGM Generator
  public toggleBgm(enabled?: boolean) {
    if (enabled !== undefined) {
      this.isBgmEnabled = enabled;
    } else {
      this.isBgmEnabled = !this.isBgmEnabled;
    }

    if (this.isBgmEnabled && !this.isMuted) {
      this.startBgmLoop();
    } else {
      this.stopBgmLoop();
    }
    return this.isBgmEnabled;
  }

  private startBgmLoop() {
    this.stopBgmLoop();
    this.initCtx();

    // 8-bit Park melody notes (C major pentatonic / cheerful theme)
    // C4=261.6, D4=293.7, E4=329.6, G4=392.0, A4=440.0, C5=523.3, E5=659.3, G5=783.9
    const melody = [
      523.25, 0, 659.25, 523.25, 392.00, 0, 440.00, 523.25,
      659.25, 783.99, 659.25, 523.25, 440.00, 0, 392.00, 0,
      329.63, 392.00, 523.25, 659.25, 523.25, 0, 440.00, 392.00,
      329.63, 0, 293.66, 329.63, 261.63, 0, 0, 0
    ];
    const bassline = [
      130.81, 130.81, 164.81, 164.81, 174.61, 174.61, 196.00, 196.00,
      130.81, 130.81, 164.81, 164.81, 174.61, 174.61, 196.00, 196.00,
      130.81, 130.81, 146.83, 146.83, 164.81, 164.81, 174.61, 174.61,
      196.00, 196.00, 174.61, 174.61, 130.81, 130.81, 196.00, 0
    ];

    const stepMs = 175; // ~170 BPM 16th notes
    this.bgmStep = 0;

    this.bgmInterval = window.setInterval(() => {
      if (this.isMuted || !this.isBgmEnabled || !this.ctx) return;

      const melFreq = melody[this.bgmStep % melody.length];
      const bassFreq = bassline[this.bgmStep % bassline.length];

      if (melFreq > 0) {
        this.playTone(melFreq, 'square', 0.12, 0.04 * this.bgmVolume * 5, 0);
      }
      if (bassFreq > 0) {
        this.playTone(bassFreq, 'triangle', 0.15, 0.06 * this.bgmVolume * 5, 0);
      }

      // Occasional gentle percussion blip on offbeats
      if (this.bgmStep % 4 === 2) {
        this.playTone(120, 'triangle', 0.04, 0.03 * this.bgmVolume * 5, 0);
      }

      this.bgmStep = (this.bgmStep + 1) % melody.length;
    }, stepMs);
  }

  private stopBgmLoop() {
    if (this.bgmInterval !== null) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopBgmLoop();
    } else if (this.isBgmEnabled) {
      this.startBgmLoop();
    }
    return this.isMuted;
  }
}

export const sound = new SoundEngine();
