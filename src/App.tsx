import React, { useState } from 'react';
import './App.css';
import { TranscriptionPanel } from './components/TranscriptionPanel';
import { Footer, ColorScheme, colorSchemes } from './components/Footer';
import styles from './styles/RetroEffects.module.css';

function App() {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(colorSchemes[0]);

  const handleColorSchemeChange = (newScheme: ColorScheme) => {
    setColorScheme(newScheme);
    document.documentElement.style.setProperty('--text-color', newScheme.textColor);
    document.documentElement.style.setProperty('--background-color', newScheme.backgroundColor);
    document.documentElement.style.setProperty('--border-color', newScheme.borderColor);
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
      </header>
      <main>
        <TranscriptionPanel />
      </main>
      <Footer 
        onColorSchemeChange={handleColorSchemeChange}
        currentScheme={colorScheme}
      />
    </div>
  );
}

export default App;
