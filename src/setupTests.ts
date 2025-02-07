// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock AudioContext and related APIs
class MockAudioContext {
  createAnalyser() {
    return {
      fftSize: 32,
      smoothingTimeConstant: 0.8,
      connect: jest.fn(),
      disconnect: jest.fn(),
      getByteFrequencyData: jest.fn(),
    };
  }
  createMediaStreamSource() {
    return {
      connect: jest.fn(),
      disconnect: jest.fn(),
    };
  }
}

class MockMediaRecorder {
  start() {}
  stop() {}
  addEventListener() {}
}

Object.defineProperty(window, 'AudioContext', {
  value: MockAudioContext,
});

Object.defineProperty(window, 'MediaRecorder', {
  value: MockMediaRecorder,
});

// Mock WebSpeech API
const mockSpeechRecognition = {
  continuous: false,
  interimResults: true,
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

Object.defineProperty(window, 'SpeechRecognition', {
  value: jest.fn().mockImplementation(() => mockSpeechRecognition),
});

Object.defineProperty(window, 'webkitSpeechRecognition', {
  value: jest.fn().mockImplementation(() => mockSpeechRecognition),
});
