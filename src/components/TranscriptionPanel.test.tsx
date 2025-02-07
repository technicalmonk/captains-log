import { render, screen, fireEvent } from '@testing-library/react';
import { TranscriptionPanel } from './TranscriptionPanel';
import { useTranscription } from '../hooks/useTranscription';

// Mock the useTranscription hook
jest.mock('../hooks/useTranscription');
jest.mock('../services/SoundEffectsService', () => {
  return {
    SoundEffectsService: jest.fn().mockImplementation(() => ({
      playStartupSound: jest.fn(),
      playBeep: jest.fn(),
      setupAudioAnalysis: jest.fn(),
      stopAudioAnalysis: jest.fn(),
    })),
  };
});

describe('TranscriptionPanel', () => {
  const mockUseTranscription = useTranscription as jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    mockUseTranscription.mockReturnValue({
      isListening: false,
      isSupported: true,
      transcription: [],
      startTranscription: jest.fn(),
      stopTranscription: jest.fn(),
      error: null,
      clearTranscription: jest.fn(),
    });

    // Mock scrollTo
    Element.prototype.scrollTo = jest.fn();
  });

  test('renders in standby mode initially', () => {
    render(<TranscriptionPanel />);
    expect(screen.getByText('START RECORDING')).toBeInTheDocument();
  });

  test('handles unsupported browser case', () => {
    mockUseTranscription.mockReturnValue({
      isSupported: false,
    });
    render(<TranscriptionPanel />);
    expect(screen.getByText(/SPEECH RECOGNITION NOT SUPPORTED/i)).toBeInTheDocument();
  });

  test('starts recording when start button is clicked', () => {
    const startTranscription = jest.fn();
    mockUseTranscription.mockReturnValue({
      isListening: false,
      isSupported: true,
      transcription: [],
      startTranscription,
      stopTranscription: jest.fn(),
      error: null,
      clearTranscription: jest.fn(),
    });

    render(<TranscriptionPanel />);
    fireEvent.click(screen.getByText('START RECORDING'));
    expect(startTranscription).toHaveBeenCalled();
  });

  test('stops recording when stop button is clicked', () => {
    const stopTranscription = jest.fn();
    mockUseTranscription.mockReturnValue({
      isListening: true,
      isSupported: true,
      transcription: [],
      startTranscription: jest.fn(),
      stopTranscription,
      error: null,
      clearTranscription: jest.fn(),
    });

    render(<TranscriptionPanel />);
    fireEvent.click(screen.getByText('STOP RECORDING'));
    expect(stopTranscription).toHaveBeenCalled();
  });
}); 