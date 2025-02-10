import React, { useState } from 'react';
import './App.css';
import { TranscriptionPanel } from './components/TranscriptionPanel';
import { NoteManagementPanel } from './components/NoteManagementPanel';
import { Footer, ColorScheme, colorSchemes } from './components/Footer';
import styles from './styles/RetroEffects.module.css';
import { Note } from './services/NoteManagementService';

function App() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(colorSchemes[0]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [activeView, setActiveView] = useState<'transcription' | 'notes'>('transcription');

  const handleColorSchemeChange = (newScheme: ColorScheme) => {
    setColorScheme(newScheme);
    document.documentElement.style.setProperty('--text-color', newScheme.textColor);
    document.documentElement.style.setProperty('--background-color', newScheme.backgroundColor);
    document.documentElement.style.setProperty('--border-color', newScheme.borderColor);
  };

  const handleNoteSelect = (note: Note) => {
    setSelectedNote(note);
  };

  return (
    <div className="App" style={{
      '--text-color': colorScheme.textColor,
      '--background-color': colorScheme.backgroundColor,
      '--border-color': colorScheme.borderColor
    } as React.CSSProperties}>
      <header className={`App-header ${styles.retroContainer} ${styles.crtEffect}`}>
        <h1 className={styles.glowText}>CAPTAIN'S LOG</h1>
        <p className={styles.pixelated}>STARDATE {new Date().toLocaleDateString()}</p>
        <div className={styles.viewControls}>
          <button
            className={`${styles.viewButton} ${activeView === 'transcription' ? styles.active : ''}`}
            onClick={() => setActiveView('transcription')}
          >
            RECORD LOG
          </button>
          <button
            className={`${styles.viewButton} ${activeView === 'notes' ? styles.active : ''}`}
            onClick={() => setActiveView('notes')}
          >
            VIEW LOGS
          </button>
        </div>
      </header>
      <main>
        {activeView === 'transcription' ? (
          <TranscriptionPanel />
        ) : (
          <NoteManagementPanel onNoteSelect={handleNoteSelect} />
        )}
      </main>
      <Footer 
        onColorSchemeChange={handleColorSchemeChange}
        currentScheme={colorScheme}
      />
    </div>
  );
}

export default App;
