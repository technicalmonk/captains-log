import { EventEmitter } from 'events';

export interface TranscriptionResult {
  text: string;
  confidence: number;
  isFinal: boolean;
  timestamp: number;
  sessionId: string;  // Added to track different recording sessions
  language?: string;
}

export interface TranscriptionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
}

export class TranscriptionService extends EventEmitter {
  private recognition: SpeechRecognition | null = null;
  private isListening: boolean = false;
  private sessionStartTime: number = 0;
  private currentSessionId: string = '';
  private lastInterimResult: string = '';
  private interimTimeout: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.initializeSpeechRecognition();
  }

  private initializeSpeechRecognition() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      throw new Error('Speech recognition is not supported in this browser.');
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;  // Keep recognition active during pauses
    this.recognition.interimResults = true;  // Enable interim results for real-time feedback
    
    this.setupEventListeners();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupEventListeners() {
    if (!this.recognition) return;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.sessionStartTime = Date.now();
      this.currentSessionId = this.generateSessionId();
      this.lastInterimResult = '';
      console.log('Recognition started - Session:', this.currentSessionId);
      this.emit('start', { timestamp: this.sessionStartTime, sessionId: this.currentSessionId });
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.interimTimeout) {
        clearTimeout(this.interimTimeout);
        this.interimTimeout = null;
      }
      // Clear any remaining interim result
      this.emit('interim', { text: '', sessionId: this.currentSessionId });
      console.log('Recognition ended - Session:', this.currentSessionId);
      this.emit('end', { sessionId: this.currentSessionId });
    };

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.results.length - 1];
      const transcript = result[0].transcript.trim();
      
      if (result.isFinal) {
        // Final result - this will persist
        console.log('Final result:', transcript);
        const transcriptionResult: TranscriptionResult = {
          text: transcript,
          confidence: result[0].confidence,
          isFinal: true,
          timestamp: this.sessionStartTime,
          sessionId: this.currentSessionId
        };
        // Clear any interim result first
        this.emit('interim', { text: '', sessionId: this.currentSessionId });
        // Then emit the final result
        this.emit('result', transcriptionResult);
      } else {
        // Interim result - this should be temporary
        console.log('Interim result:', transcript);
        this.emit('interim', {
          text: transcript,
          sessionId: this.currentSessionId
        });
      }
    };

    this.recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Recognition error:', event.error);
      this.emit('error', { error: event.error, sessionId: this.currentSessionId });
    };
  }

  public start(options: TranscriptionOptions = {}) {
    if (!this.recognition) {
      throw new Error('Speech recognition is not initialized.');
    }

    if (this.isListening) {
      this.stop();
    }

    if (options.language) {
      this.recognition.lang = options.language;
    }
    
    // Allow continuous to be configured through options, default to true
    this.recognition.continuous = options.continuous ?? true;
    this.recognition.interimResults = true;

    this.recognition.start();
  }

  public stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
    }
  }

  public isSupported(): boolean {
    return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
  }

  public getAvailableLanguages(): string[] {
    // This is a basic list of commonly supported languages
    // In a production environment, you might want to fetch this dynamically
    return [
      'en-US', // English (United States)
      'es-ES', // Spanish (Spain)
      'fr-FR', // French (France)
      'de-DE'  // German (Germany)
    ];
  }
}

// Add necessary type declarations for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
} 