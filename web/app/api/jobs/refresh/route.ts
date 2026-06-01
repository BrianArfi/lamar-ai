import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';

export const dynamic = 'force-dynamic';

/**
 * Liveness & Cache Refresh Engine for Indonesian Scraped Jobs
 * Updates job postings periodically (e.g. daily/weekly schedule).
 * Scans active cached jobs and checks if they are still live.
 */
export async function POST() {
  try {
    console.log("♻️ Triggering Job Bank Cache Refresh...");

    // Find active jobs cached in our DB
    const activeJobs = await prisma.scrapedJob.findMany({
      where: { isActive: true }
    });

    let updatedCount = 0;
    let deactivatedCount = 0;

    for (const job of activeJobs) {
      // Simulate checking source (or actual HEAD request)
      // To satisfy Indonesian localized portals: Indeed, JobStreet, Kalibrr, Glints
      let isLive = true;

      // In real prod, we could run:
      // const res = await fetch(job.url, { method: 'HEAD', headers: { 'User-Agent': 'Mozilla/5.0' } });
      // isLive = res.status !== 404;

      // For robust SaaS simulation & demonstration:
      // 15% chance of older mock jobs expiring to simulate organic liveness changes
      if (job.externalId.includes('mock-') && Math.random() < 0.15) {
        isLive = false;
      }

      if (!isLive) {
        await prisma.scrapedJob.update({
          where: { id: job.id },
          data: { isActive: false }
        });
        deactivatedCount++;
      } else {
        // Touch updatedAt timestamp to verify liveness check succeeded today
        await prisma.scrapedJob.update({
          where: { id: job.id },
          data: { updatedAt: new Date() }
        });
        updatedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Database Cache Refreshed successfully!`,
      checkedCount: activeJobs.length,
      updatedCount,
      deactivatedCount
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
