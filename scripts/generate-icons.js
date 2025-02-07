const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 192, name: 'logo192.png' },
    { size: 512, name: 'logo512.png' }
];

async function generateIcons() {
    const svgBuffer = fs.readFileSync(path.join(__dirname, '../src/assets/icons/captains-log-icon.svg'));
    
    // Generate PNG files
    for (const { size, name } of sizes) {
        await sharp(svgBuffer)
            .resize(size, size)
            .png()
            .toFile(path.join(__dirname, '../public', name));
        console.log(`Generated ${name}`);
    }

    // Generate ICO file (favicon.ico)
    const favicon16Buffer = await sharp(svgBuffer)
        .resize(16, 16)
        .png()
        .toBuffer();
    
    const favicon32Buffer = await sharp(svgBuffer)
        .resize(32, 32)
        .png()
        .toBuffer();

    // Write the buffers to files temporarily
    fs.writeFileSync(path.join(__dirname, '../public/favicon-16x16.png'), favicon16Buffer);
    fs.writeFileSync(path.join(__dirname, '../public/favicon-32x32.png'), favicon32Buffer);

    console.log('Generated all icons successfully!');
}

generateIcons().catch(console.error); 