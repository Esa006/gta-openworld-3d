'use client';

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private sirenInterval: ReturnType<typeof setInterval> | null = null;
  private isRadioPlaying: boolean = false;
  private radioInterval: ReturnType<typeof setInterval> | null = null;
  public currentStation: string = 'OFF';

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopEngine();
      this.stopSiren();
      this.stopRadio();
    }
  }

  // --- Engine Sound Simulation ---
  public updateEngine(speedRatio: number, isDriving: boolean) {
    if (this.isMuted || !isDriving) {
      this.stopEngine();
      return;
    }
    this.initCtx();
    if (!this.ctx) return;

    if (!this.engineOsc) {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineOsc.type = 'sawtooth';
      this.engineGain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      this.engineOsc.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineOsc.start();
    }

    // Pitch adjusts based on speed ratio (40 Hz idle to 180 Hz high gear)
    const baseFreq = 48 + speedRatio * 140;
    this.engineOsc.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.08);
  }

  public stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {}
      this.engineOsc = null;
      this.engineGain = null;
    }
  }

  // --- Car Horn ---
  public playHorn() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.frequency.value = 440; // A4
    osc2.frequency.value = 350; // F4
    osc1.type = 'triangle';
    osc2.type = 'triangle';

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(this.ctx.currentTime + 0.4);
    osc2.stop(this.ctx.currentTime + 0.4);
  }

  // --- Car Door Open / Slam / Hijack ---
  public playCarDoor() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // 1. Mechanical latch click
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(1400, this.ctx.currentTime);
    clickOsc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);
    clickGain.gain.setValueAtTime(0.09, this.ctx.currentTime);
    clickGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    clickOsc.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    clickOsc.start(this.ctx.currentTime);
    clickOsc.stop(this.ctx.currentTime + 0.05);

    // 2. Heavy door thud / bass slam
    const thudOsc = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thudOsc.type = 'sine';
    thudOsc.frequency.setValueAtTime(110, this.ctx.currentTime + 0.04);
    thudOsc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.25);
    thudGain.gain.setValueAtTime(0.18, this.ctx.currentTime + 0.04);
    thudGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);
    thudOsc.connect(thudGain);
    thudGain.connect(this.ctx.destination);
    thudOsc.start(this.ctx.currentTime + 0.04);
    thudOsc.stop(this.ctx.currentTime + 0.25);
  }

  // --- Tire Drift Squeal ---
  public playTireDrift() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const node = this.ctx.createBufferSource();
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.15, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.2;
    }
    node.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2800;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

    node.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    node.start();
  }

  // --- Gunshot ---
  public playGunshot() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.2, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < buffer.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.03));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3200, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.2);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start();
  }

  // --- Cash Register Cha-Ching ---
  public playCashRegister() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    [987.77, 1318.51].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.3);
    });
  }

  // --- Mission Passed Fanfare ---
  public playMissionPassed() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const startTime = this.ctx.currentTime + idx * 0.15;
      gain.gain.setValueAtTime(0.12, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    });
  }

  // --- Police Siren (2-tone wail) ---
  public startSiren() {
    if (this.isMuted || this.sirenInterval) return;
    this.initCtx();
    if (!this.ctx) return;

    let high = false;
    this.sirenInterval = setInterval(() => {
      if (this.isMuted || !this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(high ? 920 : 640, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(high ? 640 : 920, this.ctx.currentTime + 0.35);
      high = !high;

      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    }, 360);
  }

  public stopSiren() {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
  }

  // --- Dynamic Procedural Radio ---
  public cycleRadio(stationName: string) {
    this.currentStation = stationName;
    if (stationName === 'OFF') {
      this.stopRadio();
    } else {
      this.startRadio();
    }
  }

  private startRadio() {
    this.stopRadio();
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isRadioPlaying = true;
    let step = 0;
    const bassScale = [110, 130.81, 146.83, 164.81]; // A2, C3, D3, E3

    this.radioInterval = setInterval(() => {
      if (!this.isRadioPlaying || this.isMuted || !this.ctx) return;
      // Procedural Synthwave bass pulse
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      const note = bassScale[step % bassScale.length];
      osc.frequency.setValueAtTime(note, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.025, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 850;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
      step++;
    }, 240);
  }

  public stopRadio() {
    this.isRadioPlaying = false;
    if (this.radioInterval) {
      clearInterval(this.radioInterval);
      this.radioInterval = null;
    }
  }
}

export const soundFx = new SoundSynthesizer();
