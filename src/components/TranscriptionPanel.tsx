import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranscription } from '../hooks/useTranscription';
import { SoundEffectsService } from '../services/SoundEffectsService';
import styles from './TranscriptionPanel.module.css';
import retroStyles from '../styles/RetroEffects.module.css';
import GlitchEffect from './GlitchEffect';
import { NoteManagementService } from '../services/NoteManagementService';

interface TranscriptionPanelProps {
  language?: string;
}

const MAX_RECORDING_TIME_SECONDS = 20; // 20 seconds
const RED_WARNING_THRESHOLD_SECONDS = 5;
const YELLOW_WARNING_THRESHOLD_SECONDS = 10;

const soundEffects = new SoundEffectsService();

export const TranscriptionPanel: React.FC<TranscriptionPanelProps> = ({ language = 'en-US' }) => {
  const screenRef = useRef<HTMLDivElement>(null);
  const {
    isListening,
    isSupported,
    transcription,
    startTranscription,
    stopTranscription,
    clearTranscription,
    error
  } = useTranscription();

  const [signalStrength, setSignalStrength] = useState(0);
  const [isSpacebarPressed, setIsSpacebarPressed] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(MAX_RECORDING_TIME_SECONDS);
  const [status, setStatus] = useState<'standby' | 'initializing' | 'scanning' | 'processing' | 'ready'>('standby');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteService] = useState(() => new NoteManagementService());
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  useEffect(() => {
    // Play startup sound and show boot animation
    soundEffects.playStartupSound();
    setTimeout(() => {
      setIsBooting(false);
    }, 3000);
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isListening) {
      setTimeRemaining(MAX_RECORDING_TIME_SECONDS);
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            stopTranscription();
            return MAX_RECORDING_TIME_SECONDS;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeRemaining(MAX_RECORDING_TIME_SECONDS);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isListening, stopTranscription]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space' && !event.repeat && !isSpacebarPressed && !isListening && !isEditingTitle) {
      event.preventDefault();
      setIsSpacebarPressed(true);
      soundEffects.playBeep(1200, 100);
      startTranscription({ language, continuous: true, interimResults: true });
    }
  }, [startTranscription, language, isSpacebarPressed, isListening, isEditingTitle]);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space') {
      event.preventDefault();
      setIsSpacebarPressed(false);
      soundEffects.playBeep(800, 100);
      stopTranscription();
    }
  }, [stopTranscription]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (isListening) {
      soundEffects.setupAudioAnalysis(setSignalStrength);
    } else {
      soundEffects.stopAudioAnalysis();
      setSignalStrength(0);
    }
  }, [isListening]);

  const handleStart = () => {
    soundEffects.playBeep(1200, 100);
    startTranscription({ language, continuous: true, interimResults: true });
  };

  const handleStop = () => {
    soundEffects.playBeep(800, 100);
    stopTranscription();
  };

  const handleClear = () => {
    soundEffects.playBeep(600, 100);
    clearTranscription();
    setNoteTitle('');
  };

  const handleSaveNote = () => {
    if (!transcription.length) return;
    
    const title = noteTitle.trim() || `Log Entry ${new Date().toLocaleString()}`;
    noteService.createNote(title, transcription);
    soundEffects.playBeep(1000, 100);
    clearTranscription();
    setNoteTitle('');
  };

  useEffect(() => {
    if (screenRef.current) {
      screenRef.current.scrollTo({
        top: screenRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [transcription]);

  // Add status management effect
  useEffect(() => {
    if (isListening) {
      // When starting to listen, go through initialization sequence
      setStatus('initializing');
      const initTimer = setTimeout(() => {
        setStatus('scanning');
        const scanTimer = setTimeout(() => {
          setStatus('processing');
        }, 1500);
        return () => clearTimeout(scanTimer);
      }, 1000);
      return () => clearTimeout(initTimer);
    } else if (isBooting) {
      setStatus('initializing');
    } else {
      // When stopping, briefly show 'ready' then go to 'standby'
      setStatus('ready');
      const standbyTimer = setTimeout(() => {
        setStatus('standby');
      }, 1000);
      return () => clearTimeout(standbyTimer);
    }
  }, [isListening, isBooting]);

  if (!isSupported) {
    return (
      <div className={`${styles.panel} ${retroStyles.retroContainer}`}>
        <div className={retroStyles.glowText}>ERROR: SPEECH RECOGNITION NOT SUPPORTED ON THIS TERMINAL</div>
      </div>
    );
  }

  const getLatestTranscription = () => {
    const formattedText = Array.isArray(transcription) 
      ? transcription
          .map(t => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.text}`)
          .join('\n')
      : '';

    return (
      <>
        {formattedText}
        <span className={styles.cursorContainer}><span className={styles.cursor} /></span>
      </>
    );
  };

  const getSignalClass = (index: number) => {
    if (index > signalStrength) return styles.inactive;
    const level = Math.floor((index / 10) * 3);
    const activeClass = styles.active;
    switch (level) {
      case 0:
        return `${activeClass} ${styles.low}`;
      case 1:
        return `${activeClass} ${styles.medium}`;
      case 2:
        return `${activeClass} ${styles.high}`;
      default:
        return styles.inactive;
    }
  };

  const getTimerClass = () => {
    if (!isListening) return '';
    if (timeRemaining <= RED_WARNING_THRESHOLD_SECONDS) return styles.redWarning;
    if (timeRemaining <= YELLOW_WARNING_THRESHOLD_SECONDS) return styles.yellowWarning;
    return styles.normalTime;
  };

  const handleTitleFocus = () => {
    setIsEditingTitle(true);
  };

  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    soundEffects.playBeep(1000, 100);
  };

  return (
    <div className={`${styles.panel} ${retroStyles.retroContainer}`}>
      <div className={`${styles.statusBar} ${retroStyles.pixelated}`}>
        <div className={`${styles.statusText} ${styles[status]} ${retroStyles.pixelated}`}>
          STATUS: {status.toUpperCase()}
        </div>
        <div className={`${styles.timer} ${getTimerClass()} ${retroStyles.glowText}`}>
          {timeRemaining}s
        </div>
        <div className={`${styles.spacebarIndicator} ${retroStyles.crtEffect}`}>
          <div className={`${styles.led} ${isSpacebarPressed ? styles.active : ''}`} />
          <span className={isEditingTitle ? styles.disabled : ''}>SPACE</span>
        </div>
        <div className={styles.signalStrength}>
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className={`${styles.bar} ${getSignalClass(i)} ${retroStyles.crtEffect}`}
            />
          ))}
        </div>
      </div>

      <div ref={screenRef} className={`${styles.screen} ${retroStyles.crtEffect}`}>
        <GlitchEffect>
          {getLatestTranscription()}
        </GlitchEffect>
      </div>
      
      <div className={styles.controls}>
        <div className={styles.titleRow}>
          <input
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            onFocus={handleTitleFocus}
            placeholder="LOG ENTRY TITLE..."
            className={retroStyles.retroInput}
          />
          <button
            onClick={handleSaveTitle}
            className={`${styles.button} ${retroStyles.pixelated}`}
            disabled={!isEditingTitle}
          >
            SAVE TITLE
          </button>
        </div>
        <div className={styles.buttonGroup}>
          <button
            className={`${styles.button} ${isListening ? styles.active : ''} ${retroStyles.pixelated}`}
            onClick={handleStart}
            disabled={isListening || isEditingTitle}
          >
            START RECORDING
          </button>
          <button
            className={`${styles.button} ${retroStyles.pixelated}`}
            onClick={handleStop}
            disabled={!isListening}
          >
            STOP RECORDING
          </button>
          <button
            className={`${styles.button} ${retroStyles.pixelated}`}
            onClick={handleClear}
          >
            CLEAR LOG
          </button>
          <button
            className={`${styles.button} ${retroStyles.pixelated}`}
            onClick={handleSaveNote}
            disabled={transcription.length === 0}
          >
            SAVE LOG
          </button>
        </div>
      </div>
    </div>
  );
};