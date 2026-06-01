// Generate simple career-ops extension icons as valid PNG files
// Uses raw binary PNG generation (no external deps)

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { deflateSync } from 'zlib';

// Minimal PNG generator - creates a single-color square with a centered letter
function createPNG(size, bgR, bgG, bgB) {
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  
  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0); // width
  ihdrData.writeUInt32BE(size, 4); // height
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = createChunk('IHDR', ihdrData);
  
  // IDAT chunk - raw image data
  const rawData = [];
  const centerX = Math.floor(size / 2);
  const centerY = Math.floor(size / 2);
  const radius = Math.floor(size * 0.4);
  
  for (let y = 0; y < size; y++) {
    rawData.push(0); // filter byte (none)
    for (let x = 0; x < size; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < radius) {
        // Inner circle - bright indigo gradient
        const t = dist / radius;
        const r = Math.round(99 * (1 - t * 0.3));
        const g = Math.round(102 * (1 - t * 0.5));
        const b = Math.round(241 * (1 - t * 0.1));
        rawData.push(r, g, b);
      } else if (dist < radius + 2) {
        // Border ring
        rawData.push(129, 140, 248);
      } else {
        // Background - dark slate
        rawData.push(bgR, bgG, bgB);
      }
    }
  }
  
  // Compress with deflate (use zlib)
  const compressed = deflateSync(Buffer.from(rawData));
  const idat = createChunk('IDAT', compressed);
  
  // IEND chunk
  const iend = createChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  
  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcData), 0);
  
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >>> 1) ^ 0xEDB88320;
      } else {
        crc >>>= 1;
      }
    }
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

const extDir = join(process.cwd(), 'chrome-extension', 'icons');

const sizes = [16, 48, 128];
for (const size of sizes) {
  const png = createPNG(size, 15, 23, 42);
  const path = join(extDir, `icon${size}.png`);
  writeFileSync(path, png);
  console.log(`Created ${path} (${png.length} bytes)`);
}
