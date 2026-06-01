import { createRequire } from 'module';
import { readFileSync } from 'fs';

const require = createRequire(import.meta.url);

// Polyfill missing global DOMMatrix class to satisfy pdf-parse imports in Node.js runtime
if (typeof global !== 'undefined' && !global.DOMMatrix) {
  global.DOMMatrix = class DOMMatrix {};
}

const pdfParse = require('pdf-parse');

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('File path is required');
    process.exit(1);
  }

  const buffer = readFileSync(filePath);
  
  if (pdfParse.PDFParse) {
    const parser = new pdfParse.PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      console.log(result.text);
    } finally {
      await parser.destroy();
    }
  } else {
    const pdfFn = typeof pdfParse === 'function' ? pdfParse : (pdfParse.default || pdfParse);
    if (typeof pdfFn === 'function') {
      const result = await pdfFn(buffer);
      console.log(result.text);
    } else {
      throw new Error('Unsupported pdf-parse version.');
    }
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
