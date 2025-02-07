import { useState, useEffect, useCallback } from 'react';
import { TranscriptionService, TranscriptionResult, TranscriptionOptions } from '../services/TranscriptionService';

const STORAGE_KEY = 'captains_log_transcriptions';

interface UseTranscriptionReturn {
  isListening: boolean;
  isSupported: boolean;
  transcription: TranscriptionResult[];
  startTranscription: (options?: TranscriptionOptions) => void;
  stopTranscription: () => void;
  error: string | null;
  clearTranscription: () => void;
}

export const useTranscription = (): UseTranscriptionReturn => {
  const [service] = useState(() => new TranscriptionService());
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState<TranscriptionResult[]>(() => {
    // Load saved transcriptions from localStorage on initial render
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [error, setError] = useState<string | null>(null);

  // Save to localStorage whenever transcription changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transcription));
  }, [transcription]);

  useEffect(() => {
    const handleTranscriptionResult = (result: TranscriptionResult) => {
      setTranscription(prev => [...prev, result]);
    };

    const handleError = (error: string) => {
      setError(error);
      setIsListening(false);
    };

    const handleStart = () => {
      setIsListening(true);
      setError(null);
    };

    const handleEnd = () => {
      setIsListening(false);
    };

    service.on('result', handleTranscriptionResult);
    service.on('error', handleError);
    service.on('start', handleStart);
    service.on('end', handleEnd);

    return () => {
      service.removeListener('result', handleTranscriptionResult);
      service.removeListener('error', handleError);
      service.removeListener('start', handleStart);
      service.removeListener('end', handleEnd);
    };
  }, [service]);

  const startTranscription = useCallback((options?: TranscriptionOptions) => {
    try {
      service.start(options);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start transcription');
    }
  }, [service]);

  const stopTranscription = useCallback(() => {
    service.stop();
  }, [service]);

  const clearTranscription = useCallback(() => {
    setTranscription([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    isListening,
    isSupported: service.isSupported(),
    transcription,
    startTranscription,
    stopTranscription,
    error,
    clearTranscription,
  };
}; 