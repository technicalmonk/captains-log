import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useTranscription } from '../hooks/useTranscription';
import { SoundEffectsService } from '../services/SoundEffectsService';
import styles from './TranscriptionPanel.module.css';
import retroStyles from '../styles/RetroEffects.module.css';
import GlitchEffect from './GlitchEffect';

interface TranscriptionPanelProps {
  language?: string;
}

const RECORDING_LIMIT_SECONDS = 20;
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
    clearTranscription
  } = useTranscription();

  const [signalStrength, setSignalStrength] = useState(0);
  const [isSpacebarPressed, setIsSpacebarPressed] = useState(false);
  const [isBooting, setIsBooting] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(RECORDING_LIMIT_SECONDS);
  const [status, setStatus] = useState<'standby' | 'initializing' | 'scanning' | 'ready' | 'processing'>('standby');

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
      setTimeRemaining(RECORDING_LIMIT_SECONDS);
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            stopTranscription();
            return RECORDING_LIMIT_SECONDS;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setTimeRemaining(RECORDING_LIMIT_SECONDS);
    }

    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [isListening, stopTranscription]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.code === 'Space' && !event.repeat && !isSpacebarPressed) {
      event.preventDefault();
      setIsSpacebarPressed(true);
      soundEffects.playBeep(1200, 100);
      startTranscription({ language, continuous: true, interimResults: true });
    }
  }, [startTranscription, language, isSpacebarPressed]);

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

  const handleExport = () => {
    if (transcription.length === 0) return;
    
    const now = new Date();
    const fileName = `captainslog-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.txt`;
    
    const firstTime = new Date(transcription[0].timestamp).toLocaleTimeString();
    const lastTime = new Date(transcription[transcription.length - 1].timestamp).toLocaleTimeString();
    
    const dateStr = now.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const content = `Date: ${dateStr}\n\nTimecodes: ${firstTime} - ${lastTime}\n\n${transcription.map(t => t.text).join('\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getTimerClass = () => {
    if (!isListening) return '';
    if (timeRemaining <= RED_WARNING_THRESHOLD_SECONDS) return styles.redWarning;
    if (timeRemaining <= YELLOW_WARNING_THRESHOLD_SECONDS) return styles.yellowWarning;
    return '';
  };

  return (
    <div className={`${styles.panel} ${retroStyles.retroContainer}`}>
      <div ref={screenRef} className={`${styles.screen} ${retroStyles.crtEffect}`}>
        <GlitchEffect>
          {getLatestTranscription()}
        </GlitchEffect>
      </div>
      <div className={styles.controls}>
        <button
          className={`${styles.button} ${isListening ? styles.active : ''} ${retroStyles.pixelated}`}
          onClick={handleStart}
          disabled={isListening}
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
          onClick={handleExport}
          disabled={transcription.length === 0}
        >
          EXPORT LOG
        </button>
        {isListening && (
          <div className={`${styles.timer} ${getTimerClass()} ${retroStyles.glowText}`}>
            {timeRemaining}s
          </div>
        )}
      </div>

      <div className={`${styles.statusBar} ${retroStyles.pixelated}`}>
        <div className={`${styles.statusText} ${styles[status]} ${retroStyles.pixelated}`}>
          STATUS: {status.toUpperCase()}
        </div>
        <div className={`${styles.spacebarIndicator} ${retroStyles.crtEffect}`}>
          <div className={`${styles.led} ${isSpacebarPressed ? styles.active : ''}`} />
          <span>SPACE</span>
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
    </div>
  );
}; 