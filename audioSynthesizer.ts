// Web Audio API Generative Nature Ambient & Voice Analyzer

export interface SoundChannel {
  id: 'wind' | 'rain' | 'ambient' | 'waves';
  name: string;
  subname: string;
  volume: number; // 0.0 to 1.0
  isPlaying: boolean;
}

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  // Sound nodes
  private windGain: GainNode | null = null;
  private windSource: AudioNode | null = null;

  private rainGain: GainNode | null = null;
  private rainSource: AudioNode | null = null;

  private ambientGain: GainNode | null = null;
  private ambientOscillators: OscillatorNode[] = [];
  private ambientInterval: number | null = null;

  private wavesGain: GainNode | null = null;
  private wavesSource: AudioNode | null = null;
  private wavesInterval: number | null = null;

  private isMuted: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Pink noise generator for wind
  private createNoiseBuffer(): AudioBuffer {
    const bufferSize = this.ctx!.sampleRate * 2;
    const buffer = this.ctx!.createBuffer(1, bufferSize, this.ctx!.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  public playWind(volume: number = 0.4) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (!this.windGain) {
      this.windGain = this.ctx.createGain();
      this.windGain.gain.setValueAtTime(volume, this.ctx.currentTime);
      this.windGain.connect(this.masterGain);

      const noiseBuffer = this.createNoiseBuffer();
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      // Low frequency modulation for wind gusts
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.18, this.ctx.currentTime);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      noise.connect(filter);
      filter.connect(this.windGain);

      noise.start();
      lfo.start();
      this.windSource = noise;
    } else {
      this.windGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.2);
    }
  }

  public stopWind() {
    if (this.windGain && this.ctx) {
      this.windGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.3);
      setTimeout(() => {
        if (this.windSource) {
          try { (this.windSource as AudioBufferSourceNode).stop(); } catch { /* ignore */ }
          this.windSource.disconnect();
          this.windSource = null;
        }
        this.windGain?.disconnect();
        this.windGain = null;
      }, 350);
    }
  }

  public playRain(volume: number = 0.35) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (!this.rainGain) {
      this.rainGain = this.ctx.createGain();
      this.rainGain.gain.setValueAtTime(volume, this.ctx.currentTime);
      this.rainGain.connect(this.masterGain);

      const noiseBuffer = this.createNoiseBuffer();
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const highpass = this.ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.setValueAtTime(600, this.ctx.currentTime);

      const lowpass = this.ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.setValueAtTime(2200, this.ctx.currentTime);

      noise.connect(highpass);
      highpass.connect(lowpass);
      lowpass.connect(this.rainGain);

      noise.start();
      this.rainSource = noise;
    } else {
      this.rainGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.2);
    }
  }

  public stopRain() {
    if (this.rainGain && this.ctx) {
      this.rainGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.3);
      setTimeout(() => {
        if (this.rainSource) {
          try { (this.rainSource as AudioBufferSourceNode).stop(); } catch { /* ignore */ }
          this.rainSource.disconnect();
          this.rainSource = null;
        }
        this.rainGain?.disconnect();
        this.rainGain = null;
      }, 350);
    }
  }

  public playAmbientPad(volume: number = 0.3) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (!this.ambientGain) {
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(volume, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      // Pentatonic warm chords (C4, E4, G4, B4, D5)
      const freqs = [261.63, 329.63, 392.00, 493.88, 587.33];
      this.ambientOscillators = freqs.map((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const oscGain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);
        oscGain.gain.setValueAtTime(0.08 / (i + 1), this.ctx!.currentTime);

        const filter = this.ctx!.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(900, this.ctx!.currentTime);

        osc.connect(oscGain);
        oscGain.connect(filter);
        filter.connect(this.ambientGain!);
        osc.start();
        return osc;
      });
    } else {
      this.ambientGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.2);
    }
  }

  public stopAmbientPad() {
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.3);
      setTimeout(() => {
        this.ambientOscillators.forEach(osc => {
          try { osc.stop(); } catch { /* ignore */ }
          osc.disconnect();
        });
        this.ambientOscillators = [];
        this.ambientGain?.disconnect();
        this.ambientGain = null;
      }, 350);
    }
  }

  public playWaves(volume: number = 0.35) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (!this.wavesGain) {
      this.wavesGain = this.ctx.createGain();
      this.wavesGain.gain.setValueAtTime(volume, this.ctx.currentTime);
      this.wavesGain.connect(this.masterGain);

      const noiseBuffer = this.createNoiseBuffer();
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(350, this.ctx.currentTime);
      filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

      // Swell LFO
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8s wave period
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

      const swellGain = this.ctx.createGain();
      swellGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

      lfo.connect(swellGain.gain);
      noise.connect(filter);
      filter.connect(swellGain);
      swellGain.connect(this.wavesGain);

      noise.start();
      lfo.start();
      this.wavesSource = noise;
    } else {
      this.wavesGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.2);
    }
  }

  public stopWaves() {
    if (this.wavesGain && this.ctx) {
      this.wavesGain.gain.setTargetAtTime(0.001, this.ctx.currentTime, 0.3);
      setTimeout(() => {
        if (this.wavesSource) {
          try { (this.wavesSource as AudioBufferSourceNode).stop(); } catch { /* ignore */ }
          this.wavesSource.disconnect();
          this.wavesSource = null;
        }
        this.wavesGain?.disconnect();
        this.wavesGain = null;
      }, 350);
    }
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setMasterVolume(this.isMuted ? 0 : 0.7);
    return this.isMuted;
  }

  public stopAll() {
    this.stopWind();
    this.stopRain();
    this.stopAmbientPad();
    this.stopWaves();
    if (this.ambientInterval) clearInterval(this.ambientInterval);
    if (this.wavesInterval) clearInterval(this.wavesInterval);
  }
}

export const audioEngine = new AudioEngine();

// Microphone audio recorder & real-time pitch / waveform analyzer
export class VoiceAnalyzer {
  private mediaStream: MediaStream | null = null;
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private recognition: unknown = null;
  private isRecording: boolean = false;
  private onTranscriptCallback: ((text: string) => void) | null = null;

  public async startListening(
    onTranscript: (text: string) => void,
    onError: (err: string) => void
  ): Promise<boolean> {
    try {
      this.onTranscriptCallback = onTranscript;

      // Start microphone stream
      this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
      const source = this.audioCtx.createMediaStreamSource(this.mediaStream);
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      source.connect(this.analyser);

      this.isRecording = true;

      // Check for SpeechRecognition in browser
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition: unknown }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition: unknown }).webkitSpeechRecognition;

      if (SpeechRecognition) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognizer = new (SpeechRecognition as any)();
        recognizer.lang = 'ru-RU';
        recognizer.continuous = true;
        recognizer.interimResults = true;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognizer.onresult = (event: any) => {
          let current = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            current += event.results[i][0].transcript;
          }
          if (this.onTranscriptCallback) {
            this.onTranscriptCallback(current);
          }
        };

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognizer.onerror = (_e: any) => {
          // Graceful fallback: audio visualization still works!
        };

        recognizer.start();
        this.recognition = recognizer;
      }

      return true;
    } catch (e) {
      console.warn('Microphone access unavailable or denied', e);
      onError('Микрофон недоступен. Вы можете ввести текст или воспользоваться симуляцией голоса.');
      return false;
    }
  }

  public getAudioWaveData(): Uint8Array | null {
    if (!this.analyser) return null;
    const buffer = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(buffer);
    return buffer;
  }

  public getVolumeLevel(): number {
    if (!this.analyser) return 0;
    const buffer = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(buffer);
    let sum = 0;
    for (let i = 0; i < buffer.length; i++) {
      sum += buffer[i];
    }
    return sum / (buffer.length * 255);
  }

  public stopListening(): void {
    this.isRecording = false;
    if (this.recognition) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.recognition as any).stop();
      } catch { /* ignore */ }
      this.recognition = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.audioCtx) {
      try { this.audioCtx.close(); } catch { /* ignore */ }
      this.audioCtx = null;
      this.analyser = null;
    }
  }

  public isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
}
