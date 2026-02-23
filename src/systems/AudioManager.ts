import { StarColor, STAR_COLORS } from '../utils/colors';

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientOsc: OscillatorNode | null = null;
  private ambientGain: GainNode | null = null;
  private initialized = false;
  private spectrumProgress = 0;

  init(): void {
    if (this.initialized) return;
    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
      this.startAmbient();
    } catch {
      console.warn('Web Audio not available');
    }
  }

  private ensureContext(): void {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private startAmbient(): void {
    if (!this.ctx || !this.masterGain) return;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = 0.04;
    this.ambientGain.connect(this.masterGain);

    this.ambientOsc = this.ctx.createOscillator();
    this.ambientOsc.type = 'sine';
    this.ambientOsc.frequency.value = 55;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;

    this.ambientOsc.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientOsc.start();
  }

  playStarCollect(color: StarColor): void {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const cfg = STAR_COLORS.find(c => c.color === color);
    if (!cfg) return;

    const now = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    gain.connect(this.masterGain);

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(cfg.chimeFrequency, now);
    osc.frequency.exponentialRampToValueAtTime(cfg.chimeFrequency * 1.5, now + 0.15);

    const osc2 = this.ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(cfg.chimeFrequency * 2, now);
    osc2.frequency.exponentialRampToValueAtTime(cfg.chimeFrequency * 3, now + 0.3);

    const gain2 = this.ctx.createGain();
    gain2.gain.setValueAtTime(0.06, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    gain2.connect(this.masterGain);

    osc.connect(gain);
    osc2.connect(gain2);
    osc.start(now);
    osc.stop(now + 0.8);
    osc2.start(now);
    osc2.stop(now + 0.5);
  }

  playColorComplete(): void {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const freqs = [523, 659, 784];

    for (let i = 0; i < freqs.length; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freqs[i];

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now + i * 0.1);
      gain.gain.linearRampToValueAtTime(0.12, now + i * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      gain.connect(this.masterGain);

      osc.connect(gain);
      osc.start(now + i * 0.1);
      osc.stop(now + 1.2);
    }
  }

  playWinSwell(): void {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const chord = [261, 329, 392, 523, 659];

    for (const freq of chord) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 2);
      gain.gain.linearRampToValueAtTime(0.05, now + 6);
      gain.connect(this.masterGain);

      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 6);
    }

    this.spectrumProgress = 1;
    this.updateAmbient();
  }

  playQuestionMoment(): void {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const notes = [261, 392, 523];

    for (const freq of notes) {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.linearRampToValueAtTime(0.03, now + 10);
      gain.gain.linearRampToValueAtTime(0, now + 15);
      gain.connect(this.masterGain);

      osc.connect(gain);
      osc.start(now);
      osc.stop(now + 15);
    }
  }

  updateSpectrumProgress(ratio: number): void {
    this.spectrumProgress = ratio;
    this.updateAmbient();
  }

  private updateAmbient(): void {
    if (!this.ambientGain) return;
    this.ambientGain.gain.value = 0.04 + this.spectrumProgress * 0.04;
  }

  playJetpackBurst(): void {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    const bufferSize = this.ctx.sampleRate * 0.1;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.02, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    gain.connect(this.masterGain);

    noise.connect(filter);
    filter.connect(gain);
    noise.start(now);
    noise.stop(now + 0.1);
  }
}

export const audioManager = new AudioManager();
