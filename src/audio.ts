// Audio system for game sound effects
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private musicVolume: number = 0.3; // 30% volume for background music
  private isMusicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private currentMusicTrack: number = 0;

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext(): void {
    try {
      // Only create audio context if it doesn't exist
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
    } catch (error) {
      console.warn("Web Audio API not supported");
    }
  }

  // Generate a simple beep sound
  private generateBeep(
    frequency: number,
    duration: number,
    type: OscillatorType = "sine"
  ): AudioBuffer {
    if (!this.audioContext) return null as any;

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(
      1,
      sampleRate * duration,
      sampleRate
    );
    const output = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      output[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 0.3; // Reduce volume to 30%
    }

    return buffer;
  }

  // Start background music
  public startBackgroundMusic(): void {
    if (this.isMuted || this.isMusicMuted || this.isMusicPlaying) return;

    this.isMusicPlaying = true;
    this.createArcadeMusic();
  }

  // Stop background music
  public stopBackgroundMusic(): void {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  // Create simple arcade-style music
  private createArcadeMusic(): void {
    if (!this.audioContext || !this.isMusicPlaying) return;

    // Different music tracks
    const musicTracks = [
      // Track 1: Simple ascending melody
      [
        { note: 440, duration: 0.4 }, // A
        { note: 494, duration: 0.4 }, // B
        { note: 523, duration: 0.4 }, // C
        { note: 587, duration: 0.4 }, // D
        { note: 659, duration: 0.4 }, // E
        { note: 698, duration: 0.4 }, // F
        { note: 784, duration: 0.4 }, // G
        { note: 880, duration: 0.4 }, // A (octave)
      ],
      // Track 2: Descending melody
      [
        { note: 880, duration: 0.3 }, // A (octave)
        { note: 784, duration: 0.3 }, // G
        { note: 698, duration: 0.3 }, // F
        { note: 659, duration: 0.3 }, // E
        { note: 587, duration: 0.3 }, // D
        { note: 523, duration: 0.3 }, // C
        { note: 494, duration: 0.3 }, // B
        { note: 440, duration: 0.3 }, // A
      ],
      // Track 3: Arpeggio
      [
        { note: 440, duration: 0.2 }, // A
        { note: 523, duration: 0.2 }, // C
        { note: 659, duration: 0.2 }, // E
        { note: 880, duration: 0.2 }, // A (octave)
        { note: 659, duration: 0.2 }, // E
        { note: 523, duration: 0.2 }, // C
        { note: 440, duration: 0.2 }, // A
        { note: 330, duration: 0.2 }, // E (lower)
      ],
    ];

    const melody = musicTracks[this.currentMusicTrack];
    let currentTime = this.audioContext.currentTime;

    // Play the melody in a loop
    const playMelody = () => {
      if (!this.isMusicPlaying) return;

      melody.forEach(({ note, duration }) => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);

        oscillator.frequency.setValueAtTime(note, currentTime);
        oscillator.type = "square"; // 8-bit sound

        gainNode.gain.setValueAtTime(this.musicVolume * 0.05, currentTime); // Very quiet
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          currentTime + duration
        );

        oscillator.start(currentTime);
        oscillator.stop(currentTime + duration);

        currentTime += duration;
      });

      // Schedule the next loop
      this.musicInterval = window.setTimeout(() => {
        if (this.isMusicPlaying) {
          playMelody();
        }
      }, (currentTime - this.audioContext!.currentTime) * 1000);
    };

    playMelody();
  }

  // Change music track
  public changeMusicTrack(): void {
    this.currentMusicTrack = (this.currentMusicTrack + 1) % 3;
    if (this.isMusicPlaying) {
      this.stopBackgroundMusic();
      this.startBackgroundMusic();
    }
  }

  // Play a sound effect
  public playSound(
    type: "blockPlace" | "blockMiss" | "perfect" | "gameOver" | "gameStart"
  ): void {
    if (this.isMuted || !this.audioContext) return;

    let buffer: AudioBuffer;

    switch (type) {
      case "blockPlace":
        buffer = this.generateBeep(800, 0.1);
        break;
      case "blockMiss":
        buffer = this.generateBeep(200, 0.3);
        break;
      case "perfect":
        buffer = this.generateBeep(1200, 0.2);
        break;
      case "gameOver":
        buffer = this.generateBeep(150, 0.5);
        break;
      case "gameStart":
        buffer = this.generateBeep(600, 0.15);
        break;
      default:
        return;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(this.audioContext.destination);
    source.start();
  }

  // Toggle sound effects mute
  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    console.log("Sound effects muted:", this.isMuted);
  }

  // Toggle music mute
  public toggleMusicMute(): void {
    this.isMusicMuted = !this.isMusicMuted;
    if (this.isMusicMuted) {
      this.stopBackgroundMusic();
    } else if (!this.isMuted) {
      this.startBackgroundMusic();
    }
    console.log("Music muted:", this.isMusicMuted);
  }

  // Get sound effects mute status
  public getMuted(): boolean {
    return this.isMuted;
  }

  // Get music mute status
  public getMusicMuted(): boolean {
    return this.isMusicMuted;
  }

  // Get current music track
  public getCurrentMusicTrack(): number {
    return this.currentMusicTrack;
  }
}

export const audioManager = new AudioManager();
