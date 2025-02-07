export class SoundEffectsService {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private analyser: AnalyserNode | null = null;
  private mediaStream: MediaStream | null = null;
  private onLevelChange: ((level: number) => void) | null = null;
  private animationFrame: number | null = null;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext() {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 32;
    this.analyser.smoothingTimeConstant = 0.8;
  }

  public async setupAudioAnalysis(onLevelChange: (level: number) => void) {
    try {
      this.onLevelChange = onLevelChange;
      if (!this.mediaStream) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (this.audioContext && this.analyser) {
          const source = this.audioContext.createMediaStreamSource(this.mediaStream);
          source.connect(this.analyser);
          this.startAnalysis();
        }
      }
    } catch (error) {
      console.error('Error setting up audio analysis:', error);
    }
  }

  private startAnalysis() {
    if (!this.analyser || !this.onLevelChange) return;

    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    const analyze = () => {
      if (this.analyser && this.onLevelChange) {
        this.analyser.getByteFrequencyData(dataArray);
        // Calculate average volume level (0-1)
        const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
        const normalizedLevel = Math.min(Math.floor((average / 255) * 10), 9);
        this.onLevelChange(normalizedLevel);
      }
      
      this.animationFrame = requestAnimationFrame(analyze);
    };
    
    analyze();
  }

  public stopAudioAnalysis() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    if (this.onLevelChange) {
      this.onLevelChange(0);
    }
  }

  public playBeep(frequency: number = 800, duration: number = 100) {
    if (!this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
    
    gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.start();
    oscillator.stop(this.audioContext.currentTime + duration / 1000);
  }

  public playStartupSound() {
    if (!this.audioContext) return;
    
    const frequencies = [400, 800, 1200];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playBeep(freq, 150);
      }, index * 200);
    });
  }

  public playModemSound() {
    if (!this.audioContext) return;
    
    const frequencies = [1200, 2400, 1800, 1200, 2400];
    const durations = [100, 100, 150, 100, 200];
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playBeep(freq, durations[index]);
      }, index * 150);
    });
  }

  public playShutdownSound() {
    if (!this.audioContext) return;
    
    const frequencies = [1200, 800, 400];
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        this.playBeep(freq, 150);
      }, index * 200);
    });
  }
} 