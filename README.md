# Captain's Log

An 80s-inspired voice note dictation and transcription application that provides a unique, efficient, and enjoyable user experience for capturing and managing spoken thoughts, ideas, and notes.

![Captain's Log](/img/captainslog-screenshot.PNG)

## Features

- 🎙️ **Voice Recording**
  - High-quality audio recording with intuitive controls
  - Visual feedback with retro-style VU meter
  - Background recording support
  - Adjustable input levels

- 📝 **Smart Transcription**
  - Automatic voice-to-text conversion
  - Support for multiple languages
  - Offline transcription capabilities

- 🕹️ **Retro UI/UX**
  - Authentic 80s computer aesthetic
  - Monochrome/limited color schemes
  - Classic terminal-style interface
  - Period-appropriate sound effects
  - Command-line interface for power users

- 🔒 **Security & Privacy**
  - Local-first storage
  - Optional encrypted cloud sync
  - GDPR and CCPA compliant
  - Clear privacy controls

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Modern web browser (Chrome, Firefox, Safari)

### Installation

1. Clone the repository:
```powershell
git clone https://github.com/technicalmonk/captains-log.git
cd captains-log
```

2. Install dependencies:
```powershell
npm install
```

3. Start the development server:
```powershell
npm start
```

The application will open in your default browser at `http://localhost:3000`.

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Technology Stack

- Frontend: React
- Speech Recognition: Web Speech API
- Styling: CSS Modules
- State Management: React Hooks

## Contributing

We welcome contributions! Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by 1980s computer systems
- Built with modern web technologies
- Designed for privacy and efficiency

## Support

For support, please open an issue in the GitHub repository or contact our support team.

## Deployment

### Building for Production

1. Create a production build:
```powershell
npm run build
```

2. The build folder will contain production-ready files that can be served by any static hosting service.

### Deployment Options

1. **Static Hosting (Recommended)**
   - Netlify
   - Vercel
   - GitHub Pages
   - AWS S3 + CloudFront

2. **Traditional Hosting**
   - Apache
   - Nginx
   - IIS

### Environment Setup
1. Copy `.env.example` to `.env`
2. Update the environment variables as needed
3. Rebuild the application

## Browser Compatibility

Tested and supported in:
- Chrome (latest 3 versions)
- Firefox (latest 3 versions)
- Safari (latest 2 versions)
- Edge (latest 3 versions)

Note: Speech recognition features may vary by browser.

## Troubleshooting

### Common Issues

1. **Microphone Access**
   - Ensure browser has microphone permissions
   - Check system microphone settings
   - Verify SSL if running in production

2. **Transcription Issues**
   - Confirm language settings
   - Check internet connection for cloud features
   - Verify Web Speech API browser support

3. **Build Problems**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall
   - Verify Node.js version

For more issues, please check our [Issues](https://github.com/technicalmonk/captains-log/issues) page.
