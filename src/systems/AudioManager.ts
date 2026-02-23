import { StarColor, STAR_COLORS } from '../utils/colors';

interface PadVoice {
  osc: OscillatorNode;
  gain: GainNode;
}

export class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private initialized = false;
  private spectrumProgress = 0;

  private padVoices: PadVoice[] = [];
  private padGain: GainNode | null = null;
  private lfoNode: OscillatorNode | null = null;
  private arpInterval: ReturnType<typeof setInterval> | null = null;
  private reverbConvolver: ConvolverNode | null = null;
  private blackHoleOsc: OscillatorNode | null = null;
  private blackHoleGain: GainNode | null = null;

  init(): void {
    if (this.initialized) return;
    try {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.3;
      this.masterGain.connect(this.ctx.destination);
      this.reverbConvolver = this.createReverb();
      this.initialized = true;
      this.startAmbientPad();
      this.startArpeggiator();
    } catch {
      console.warn('Web Audio not available');
    }
  }

  private ensureContext(): void {
    if (this.ctx?.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private createReverb(): ConvolverNode | null {
    if (!this.ctx) return null;
    const convolver = this.ctx.createConvolver();
    const rate = this.ctx.sampleRate;
    const length = rate * 2;
    const buffer = this.ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
      }
    }
    convolver.buffer = buffer;
    return convolver;
  }

  private startAmbientPad(): void {
    if (!this.ctx || !this.masterGain) return;

    this.padGain = this.ctx.createGain();
    this.padGain.gain.value = 0;
    this.padGain.connect(this.masterGain);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 300;
    filter.Q.value = 1;
    filter.connect(this.padGain);

    this.lfoNode = this.ctx.createOscillator();
    this.lfoNode.type = 'sine';
    this.lfoNode.frequency.value = 0.15;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 50;
    this.lfoNode.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    this.lfoNode.start();

    const baseFreqs = [55, 82.5, 110, 55.5, 82, 110.5];
    const types: OscillatorType[] = ['sine', 'sine', 'triangle', 'sine', 'sine', 'triangle'];

    for (let i = 0; i < baseFreqs.length; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = types[i];
      osc.frequency.value = baseFreqs[i];
      const voiceGain = this.ctx.createGain();
      voiceGain.gain.value = i < 2 ? 0.04 : 0;
      osc.connect(voiceGain);
      voiceGain.connect(filter);
      osc.start();
      this.padVoices.push({ osc, gain: voiceGain });
    }

    this.padGain.gain.setValueAtTime(0, this.ctx.currentTime);
    this.padGain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 4);
  }

  private startArpeggiator(): void {
    if (!this.ctx || !this.masterGain) return;

    const notes = [130.81, 164.81, 196, 261.63, 196, 164.81];
    let noteIdx = 0;

    const scheduleNext = () => {
      const baseDelay = 4000 - this.spectrumProgress * 2500;
      const jitter = (0.5 + Math.random()) * 500;
      const delay = Math.max(800, baseDelay + jitter);
      this.arpInterval = setTimeout(() => {
        if (!this.ctx || !this.masterGain) return;
        if (this.spectrumProgress >= 0.15) {
          const now = this.ctx.currentTime;
          const volume = 0.015 * Math.min(this.spectrumProgress * 2, 1);

          const osc = this.ctx.createOscillator();
          osc.type = 'sine';
          osc.frequency.value = notes[noteIdx % notes.length];
          noteIdx++;

          const gain = this.ctx.createGain();
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(volume, now + 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 2);

          osc.connect(gain);
          if (this.reverbConvolver) {
            const reverbSend = this.ctx.createGain();
            reverbSend.gain.value = 0.3;
            gain.connect(reverbSend);
            reverbSend.connect(this.reverbConvolver);
            this.reverbConvolver.connect(this.masterGain);
          }
          gain.connect(this.masterGain);
          osc.start(now);
          osc.stop(now + 2.5);
        }
        scheduleNext();
      }, delay);
    };
    scheduleNext();
  }

  playStarCollect(color: StarColor): void {
    this.ensureContext();
    if (!this.ctx || !this.masterGain) return;

    const cfg = STAR_COLORS.find(c => c.color === color);
    if (!cfg) return;

    const now = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
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
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
    gain2.connect(this.masterGain);

    osc.connect(gain);
    osc2.connect(gain2);

    if (this.reverbConvolver) {
      const reverbSend = this.ctx.createGain();
      reverbSend.gain.value = 0.25;
      gain.connect(reverbSend);
      gain2.connect(reverbSend);
      reverbSend.connect(this.reverbConvolver);
      this.reverbConvolver.connect(this.masterGain);
    }

    osc.start(now);
    osc.stop(now + 1.2);
    osc2.start(now);
    osc2.stop(now + 0.8);
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
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      gain.connect(this.masterGain);

      osc.connect(gain);
      if (this.reverbConvolver) {
        const reverbSend = this.ctx.createGain();
        reverbSend.gain.value = 0.4;
        gain.connect(reverbSend);
        reverbSend.connect(this.reverbConvolver);
        this.reverbConvolver.connect(this.masterGain);
      }
      osc.start(now + i * 0.1);
      osc.stop(now + 1.5);
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

    const osc5 = this.ctx.createOscillator();
    osc5.type = 'triangle';
    osc5.frequency.value = 130.81;
    const g5 = this.ctx.createGain();
    g5.gain.setValueAtTime(0, now);
    g5.gain.linearRampToValueAtTime(0.04, now + 3);
    g5.gain.linearRampToValueAtTime(0, now + 8);
    g5.connect(this.masterGain);
    osc5.connect(g5);
    osc5.start(now);
    osc5.stop(now + 8);

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

    const padOsc = this.ctx.createOscillator();
    padOsc.type = 'triangle';
    padOsc.frequency.value = 196;
    const padG = this.ctx.createGain();
    padG.gain.setValueAtTime(0, now);
    padG.gain.linearRampToValueAtTime(0.02, now + 3);
    padG.gain.linearRampToValueAtTime(0, now + 15);
    padG.connect(this.masterGain);
    padOsc.connect(padG);
    padOsc.start(now);
    padOsc.stop(now + 15);
  }

  updateSpectrumProgress(ratio: number): void {
    this.spectrumProgress = ratio;
    this.updateAmbient();
  }

  private updateAmbient(): void {
    if (!this.padGain || !this.ctx) return;
    const now = this.ctx.currentTime;

    this.padGain.gain.linearRampToValueAtTime(
      0.06 + this.spectrumProgress * 0.06, now + 1,
    );

    for (let i = 0; i < this.padVoices.length; i++) {
      const threshold = i / this.padVoices.length;
      const target = this.spectrumProgress > threshold ? 0.035 : 0;
      this.padVoices[i].gain.gain.linearRampToValueAtTime(target, now + 2);
    }

    if (this.lfoNode && this.spectrumProgress > 0.5) {
      this.lfoNode.frequency.linearRampToValueAtTime(
        0.15 + this.spectrumProgress * 0.1, now + 1,
      );
    }
  }

  updateBlackHoleProximity(closestDistance: number, pullRadius: number): void {
    if (!this.ctx || !this.masterGain) return;

    if (!this.blackHoleOsc) {
      this.blackHoleOsc = this.ctx.createOscillator();
      this.blackHoleOsc.type = 'sine';
      this.blackHoleOsc.frequency.value = 40;
      this.blackHoleGain = this.ctx.createGain();
      this.blackHoleGain.gain.value = 0;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 80;
      filter.Q.value = 8;

      this.blackHoleOsc.connect(filter);
      filter.connect(this.blackHoleGain);
      this.blackHoleGain.connect(this.masterGain);
      this.blackHoleOsc.start();
    }

    if (!this.blackHoleGain) return;
    const now = this.ctx.currentTime;
    if (closestDistance < pullRadius) {
      const intensity = Math.pow(1 - closestDistance / pullRadius, 2);
      this.blackHoleGain.gain.linearRampToValueAtTime(intensity * 0.12, now + 0.1);
      this.blackHoleOsc!.frequency.linearRampToValueAtTime(35 + intensity * 25, now + 0.1);
    } else {
      this.blackHoleGain.gain.linearRampToValueAtTime(0, now + 0.3);
    }
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
