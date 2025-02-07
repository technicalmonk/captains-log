import React from 'react';
import styles from './Footer.module.css';

export type ColorScheme = {
  name: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
};

const colorSchemes: ColorScheme[] = [
  {
    name: 'Green Terminal',
    textColor: '#00ff00',
    backgroundColor: '#000000',
    borderColor: '#00ff00'
  },
  {
    name: 'Amber Terminal',
    textColor: '#ffb000',
    backgroundColor: '#000000',
    borderColor: '#ffb000'
  },
  {
    name: 'White Terminal',
    textColor: '#ffffff',
    backgroundColor: '#000000',
    borderColor: '#ffffff'
  }
];

interface FooterProps {
  onColorSchemeChange: (scheme: ColorScheme) => void;
  currentScheme: ColorScheme;
}

export const Footer: React.FC<FooterProps> = ({ onColorSchemeChange, currentScheme }) => {
  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.copyright}>
          Created by Pete Shimshock, 2025
        </div>
        <div className={styles.colorSchemes}>
          <span className={styles.label}>COLOR SCHEME:</span>
          <div className={styles.schemeButtons}>
            {colorSchemes.map((scheme) => (
              <button
                key={scheme.name}
                className={`${styles.schemeButton} ${scheme.name === currentScheme.name ? styles.active : ''}`}
                onClick={() => onColorSchemeChange(scheme)}
                style={{
                  '--button-color': scheme.textColor,
                  '--button-border': scheme.borderColor
                } as React.CSSProperties}
              >
                {scheme.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export { colorSchemes }; 