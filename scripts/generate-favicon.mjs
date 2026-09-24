import fs from 'fs';
import path from 'path';

// Clean SVG icon for LowStudy (Scale of Justice in dark blue with gold/amber accents)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fbbf24" />
      <stop offset="100%" stop-color="#d97706" />
    </linearGradient>
  </defs>
  <rect width="64" height="64" rx="14" fill="url(#bgGrad)"/>
  <rect x="2" y="2" width="60" height="60" rx="12" fill="none" stroke="#f59e0b" stroke-width="1.5" opacity="0.3"/>
  <path d="M32 12v36M22 48h20M32 16l-16 9M32 16l16 9" stroke="url(#goldGrad)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16 25l-5 12h10l-5-12z" fill="#d97706" stroke="#fbbf24" stroke-width="1.5" stroke-linejoin="round"/>
  <path d="M48 25l-5 12h10l-5-12z" fill="#d97706" stroke="#fbbf24" stroke-width="1.5" stroke-linejoin="round"/>
  <circle cx="32" cy="13" r="3.5" fill="#f59e0b"/>
</svg>`;

// Write SVGs
fs.writeFileSync('public/favicon.svg', svgContent, 'utf8');
fs.writeFileSync('public/icon.svg', svgContent, 'utf8');

// Generate a valid 32x32 BMP ICO binary for standard favicon.ico
function createIco() {
  const width = 32;
  const height = 32;
  const bpp = 32; // 32-bit BGRA
  const imageSize = width * height * 4; // 4096 bytes
  const maskSize = Math.ceil(width / 32) * 4 * height; // 128 bytes
  const dibHeaderSize = 40;
  const totalImageDataSize = dibHeaderSize + imageSize + maskSize; // 4264 bytes
  const icoHeaderSize = 6;
  const icoDirEntrySize = 16;
  const imageOffset = icoHeaderSize + icoDirEntrySize; // 22 bytes
  const totalFileSize = imageOffset + totalImageDataSize;

  const buf = Buffer.alloc(totalFileSize);

  // ICO Header
  buf.writeUInt16LE(0, 0); // Reserved
  buf.writeUInt16LE(1, 2); // Type 1 = Icon
  buf.writeUInt16LE(1, 4); // 1 Image

  // Directory Entry
  buf.writeUInt8(width, 6); // Width
  buf.writeUInt8(height, 7); // Height
  buf.writeUInt8(0, 8); // Color count
  buf.writeUInt8(0, 9); // Reserved
  buf.writeUInt16LE(1, 10); // Color planes
  buf.writeUInt16LE(bpp, 12); // Bits per pixel
  buf.writeUInt32LE(totalImageDataSize, 14); // Image data size
  buf.writeUInt32LE(imageOffset, 18); // Image data offset

  // BITMAPINFOHEADER (DIB Header)
  let offset = imageOffset;
  buf.writeUInt32LE(dibHeaderSize, offset); // Header size
  buf.writeInt32LE(width, offset + 4); // Width
  buf.writeInt32LE(height * 2, offset + 8); // Height (doubled for XOR + AND masks)
  buf.writeUInt16LE(1, offset + 12); // Planes
  buf.writeUInt16LE(bpp, offset + 14); // Bit count
  buf.writeUInt32LE(0, offset + 16); // Compression (BI_RGB = 0)
  buf.writeUInt32LE(imageSize + maskSize, offset + 20); // Image size
  buf.writeInt32LE(0, offset + 24); // X pixels per meter
  buf.writeInt32LE(0, offset + 28); // Y pixels per meter
  buf.writeUInt32LE(0, offset + 32); // Colors used
  buf.writeUInt32LE(0, offset + 36); // Important colors

  offset += dibHeaderSize;

  // Pixel Data (Bottom-up BGRA)
  // Draw dark blue background (#0f172a) with rounded corners and gold scale center
  for (let y = 0; y < height; y++) {
    // In bottom-up DIB, y=0 is bottom row, y=31 is top row
    const actualY = height - 1 - y;
    for (let x = 0; x < width; x++) {
      const pOffset = offset + (y * width + x) * 4;
      
      // Check rounded rectangle bounds (corner radius ~ 6)
      const dx = Math.min(x, width - 1 - x);
      const dy = Math.min(actualY, height - 1 - actualY);
      let isInside = true;
      if (dx < 6 && dy < 6) {
        const cornerDist = Math.sqrt(Math.pow(6 - dx, 2) + Math.pow(6 - dy, 2));
        if (cornerDist > 6.5) isInside = false;
      }

      if (!isInside) {
        // Transparent
        buf.writeUInt8(0, pOffset); // B
        buf.writeUInt8(0, pOffset + 1); // G
        buf.writeUInt8(0, pOffset + 2); // R
        buf.writeUInt8(0, pOffset + 3); // A
        continue;
      }

      // Draw Scales of justice
      // Center vertical bar at x=15, 16, y=7 to 24
      // Base at y=23, 24, x=10 to 21
      // Top bar at y=9, x=7 to 24
      // Left pan at x=8, y=14..18
      // Right pan at x=23, y=14..18
      const isCenterBar = (x === 15 || x === 16) && actualY >= 7 && actualY <= 24;
      const isBase = actualY >= 23 && actualY <= 25 && x >= 10 && x <= 21;
      const isBeam = actualY >= 9 && actualY <= 11 && x >= 7 && x <= 24;
      const isLeftStrings = (x === 7 || x === 11) && actualY >= 11 && actualY <= 15;
      const isRightStrings = (x === 20 || x === 24) && actualY >= 11 && actualY <= 15;
      const isLeftPan = actualY >= 15 && actualY <= 17 && x >= 6 && x <= 12;
      const isRightPan = actualY >= 15 && actualY <= 17 && x >= 19 && x <= 25;
      const isTopBall = actualY >= 6 && actualY <= 8 && x >= 14 && x <= 17;

      if (isCenterBar || isBase || isBeam || isLeftStrings || isRightStrings || isLeftPan || isRightPan || isTopBall) {
        // Amber/Gold #F59E0B -> R=245, G=158, B=11
        buf.writeUInt8(11, pOffset); // B
        buf.writeUInt8(158, pOffset + 1); // G
        buf.writeUInt8(245, pOffset + 2); // R
        buf.writeUInt8(255, pOffset + 3); // A
      } else {
        // Background Dark Slate #0F172A -> R=15, G=23, B=42
        buf.writeUInt8(42, pOffset); // B
        buf.writeUInt8(23, pOffset + 1); // G
        buf.writeUInt8(15, pOffset + 2); // R
        buf.writeUInt8(255, pOffset + 3); // A
      }
    }
  }

  // AND Mask (1 bit per pixel, 0 = opaque, 1 = transparent)
  offset += imageSize;
  for (let y = 0; y < height; y++) {
    const actualY = height - 1 - y;
    let rowMask = 0;
    for (let x = 0; x < width; x++) {
      const dx = Math.min(x, width - 1 - x);
      const dy = Math.min(actualY, height - 1 - actualY);
      let isTransparent = false;
      if (dx < 6 && dy < 6) {
        const cornerDist = Math.sqrt(Math.pow(6 - dx, 2) + Math.pow(6 - dy, 2));
        if (cornerDist > 6.5) isTransparent = true;
      }
      if (isTransparent) {
        rowMask |= (1 << (7 - (x % 8)));
      }
      if (x % 8 === 7 || x === width - 1) {
        buf.writeUInt8(rowMask, offset + y * 4 + Math.floor(x / 8));
        rowMask = 0;
      }
    }
  }

  return buf;
}

const icoBuf = createIco();
fs.writeFileSync('public/favicon.ico', icoBuf);
fs.writeFileSync('src/app/favicon.ico', icoBuf);
console.log('Successfully generated public/favicon.ico, src/app/favicon.ico, and public/icon.svg');
