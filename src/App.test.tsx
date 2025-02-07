import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the TranscriptionPanel component
jest.mock('./components/TranscriptionPanel', () => ({
  TranscriptionPanel: () => <div data-testid="transcription-panel">Transcription Panel</div>
}));

describe('App', () => {
  test('renders transcription panel', () => {
    render(<App />);
    const panelElement = screen.getByTestId('transcription-panel');
    expect(panelElement).toBeInTheDocument();
  });
});
