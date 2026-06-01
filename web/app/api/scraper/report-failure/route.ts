import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reports = await prisma.scraperFailureReport.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, data: reports });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { url, platform, source, failureType, errorMessage, htmlSnippet } = await request.json();

    if (!url || !source || !failureType || !errorMessage) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required parameters: url, source, failureType, errorMessage.' 
      }, { status: 400 });
    }

    // Extract host domain from URL
    let host = 'unknown';
    try {
      const parsedUrl = new URL(url);
      host = parsedUrl.host;
    } catch {
      host = url;
    }

    // Determine platform name if not explicitly provided
    let deducedPlatform = platform;
    if (!deducedPlatform) {
      if (url.includes('glints.com')) deducedPlatform = 'Glints';
      else if (url.includes('kalibrr.com')) deducedPlatform = 'Kalibrr';
      else if (url.includes('indeed.com')) deducedPlatform = 'Indeed';
      else if (url.includes('jobstreet.com') || url.includes('jobstreet.co.id')) deducedPlatform = 'JobStreet';
      else deducedPlatform = 'Custom Job Board';
    }

    // Create report entry in SQLite
    const report = await prisma.scraperFailureReport.create({
      data: {
        url,
        host,
        platform: deducedPlatform,
        source, // "SERVER_SIDE" | "CHROME_EXTENSION"
        failureType, // "SKELETON_DETECTED" | "ANTI_BOT_BLOCKED" | "SELECTOR_MISSING" | "NETWORK_ERROR"
        errorMessage,
        htmlSnippet: htmlSnippet || null
      }
    });

    console.log(`⚠️ Scraper Failure Reported for ${host} (${failureType}): ${errorMessage}`);

    return NextResponse.json({ success: true, data: report });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    await prisma.scraperFailureReport.deleteMany();
    return NextResponse.json({ success: true, message: 'All diagnostics reports successfully cleared.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
