import { NextResponse } from 'next/server';
import { writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { createRequire } from 'module';

export const dynamic = 'force-dynamic';

const require = createRequire(import.meta.url);
const mammothImport = require('mammoth');
const mammoth = mammothImport.extractRawText ? mammothImport : (mammothImport.default || mammothImport);

// Resilient pdf parsing that runs in a standalone process to bypass Next.js / Turbopack dynamic worker bundle errors
async function parsePdf(buffer: Buffer): Promise<string> {
  const tempFilename = `temp_cv_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;
  const tempPath = join(process.cwd(), 'app', 'lib', tempFilename);
  const workerPath = join(process.cwd(), 'app', 'lib', 'parse-pdf-worker.mjs');

  try {
    // Write temporary PDF file
    writeFileSync(tempPath, buffer);

    // Execute standalone parser CLI outside the Next.js bundle context
    console.log(`🚀 Executing standalone PDF parser for ${tempFilename}`);
    const cvText = execSync(`node "${workerPath}" "${tempPath}"`, { 
      encoding: 'utf-8',
      maxBuffer: 10 * 1024 * 1024 // 10MB limit
    });

    return cvText;
  } catch (err: any) {
    console.error('Standalone PDF parse error:', err);
    throw new Error(err.stderr || err.message || 'Failed to extract text from PDF document.');
  } finally {
    // Clean up temp file
    try {
      unlinkSync(tempPath);
    } catch (cleanupErr) {
      console.warn('Temporary file cleanup failed:', cleanupErr);
    }
  }
}

// Extract Google Drive File ID from URL
function getGoogleDriveId(url: string): string | null {
  const match = url.match(/[-\w]{25,}(?!.*[-\w]{25,})/);
  return match ? match[0] : null;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const driveUrl = formData.get('driveUrl') as string | null;

    let cvText = '';

    // 1. Process Google Drive URL
    if (driveUrl) {
      const fileId = getGoogleDriveId(driveUrl);
      if (!fileId) {
        return NextResponse.json({ success: false, error: 'Invalid Google Drive link format.' }, { status: 400 });
      }

      console.log(`📂 Processing Google Drive file ID: ${fileId}`);
      
      // Try Google Doc text export endpoint (ideal for native Google Docs)
      const exportUrl = `https://docs.google.com/document/d/${fileId}/export?format=txt`;
      let res = await fetch(exportUrl);
      
      if (res.ok) {
        cvText = await res.text();
      } else {
        // Fallback to downloading raw binary file (e.g. PDF/Word file stored on Google Drive)
        const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
        res = await fetch(downloadUrl);
        if (!res.ok) {
          throw new Error('Failed to access Google Drive file. Ensure file sharing is set to "Anyone with the link".');
        }

        const buffer = Buffer.from(await res.arrayBuffer());
        const contentType = res.headers.get('content-type') || '';

        if (contentType.includes('pdf')) {
          cvText = await parsePdf(buffer);
        } else if (contentType.includes('word') || contentType.includes('officedocument')) {
          const parsed = await mammoth.extractRawText({ buffer });
          cvText = parsed.value;
        } else {
          cvText = buffer.toString('utf-8');
        }
      }

    // 2. Process Direct Uploaded File
    } else if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const fileType = file.name.split('.').pop()?.toLowerCase();

      if (fileType === 'pdf') {
        cvText = await parsePdf(buffer);
      } else if (fileType === 'docx') {
        const parsed = await mammoth.extractRawText({ buffer });
        cvText = parsed.value;
      } else {
        cvText = buffer.toString('utf-8');
      }
    } else {
      return NextResponse.json({ success: false, error: 'No resume file or link was provided.' }, { status: 400 });
    }

    return NextResponse.json({ success: true, text: cvText.trim() });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
