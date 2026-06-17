const sharp = require('sharp');
const path  = require('path');

const inputSvg = path.join(__dirname, 'logo_transparent.svg');

async function generate() {
  const sizes = [
    { name: 'favicon-16x16.png',  size: 16  },
    { name: 'favicon-32x32.png',  size: 32  },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'favicon-192x192.png', size: 192 },
    { name: 'favicon-512x512.png', size: 512 }
  ];

  for (const { name, size } of sizes) {
    await sharp(inputSvg, { density: 300 })
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(path.join(__dirname, name));
    console.log(`✓ ${name} (${size}×${size})`);
  }

  console.log('\nAll favicon assets generated successfully!');
}

generate().catch(err => {
  console.error('Error generating favicons:', err.message);
  process.exit(1);
});
