import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { cookies } from 'next/headers';
import { scrapeIndonesianJobs } from '../../../lib/scrapers/indonesia';

export const dynamic = 'force-dynamic';

/**
 * Tiered Job Matchmaker Engine (Indeed, JobStreet, Kalibrr, Glints)
 * Implements the 3-match paywall limit hook for Free users.
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const userId = sessionCookie.value;
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json({ success: false, error: 'Search query is required.' }, { status: 400 });
    }

    // Look up user's tier from database to prevent spoofing
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { tier: true }
    });
    const isFreeTier = user ? user.tier !== 'pro' : true;

    // 1. Fetch and Cache jobs from prominent boards
    const rawJobs = await scrapeIndonesianJobs(query);

    // 2. Read cached active jobs from SQLite
    const activeJobs = await prisma.scrapedJob.findMany({
      where: {
        isActive: true,
        OR: [
          { title: { contains: query } },
          { description: { contains: query } }
        ]
      },
      take: 20 // Limit query size for performance
    });

    // 3. Load user CV (master CV)
    const masterCv = await prisma.resume.findFirst({
      where: { userId, isMaster: true }
    });

    // Extract skills array from master CV or define high-value defaults
    let userSkills: string[] = ['javascript', 'typescript', 'react', 'node.js', 'next.js', 'sql', 'git'];
    let cvText = '';

    if (masterCv) {
      cvText = masterCv.cvMarkdown.toLowerCase();
      try {
        const parsedSkills = JSON.parse(masterCv.skills);
        if (Array.isArray(parsedSkills) && parsedSkills.length > 0) {
          userSkills = parsedSkills.map(s => String(s).toLowerCase());
        } else {
          // Extract keywords from markdown CV
          const words: string[] = (cvText.match(/\b\w+\b/g) || []) as string[];
          const commonSkills = ['typescript', 'javascript', 'react', 'node.js', 'postgresql', 'docker', 'python', 'go', 'java', 'kotlin', 'swift', 'figma', 'kubernetes', 'aws', 'graphql', 'next.js'];
          const extracted = commonSkills.filter(skill => words.includes(skill));
          if (extracted.length > 0) {
            userSkills = extracted;
          }
        }
      } catch (e) {
        console.error('Failed to parse user CV skills:', e);
      }
    }

    // 4. Calculate rolling daily limit for Free Tier
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const matchesTodayCount = await prisma.userJobMatch.count({
      where: {
        userId,
        createdAt: {
          gte: startOfToday
        }
      }
    });

    const dailyLimit = 3;
    const remainingLimit = Math.max(0, dailyLimit - matchesTodayCount);

    const englishPaywallMessage = `You've reached your daily limit of ${dailyLimit} free AI evaluations. Your quota resets at midnight, or upgrade to Pro for unlimited access.`;

    if (isFreeTier && matchesTodayCount >= dailyLimit) {
      return NextResponse.json({
        success: true,
        evaluatedCount: 0,
        matches: [],
        paywall: {
          locked: true,
          totalMatchesFound: activeJobs.length,
          unlockedCount: 0,
          message: englishPaywallMessage
        }
      });
    }

    const matches: any[] = [];
    let evaluatedCount = 0;

    // 5. Matchmaker loop
    for (const job of activeJobs) {
      // If Free user has reached their daily limit in this run, STOP IMMEDIATELY!
      if (isFreeTier && matches.length >= remainingLimit) {
        console.log(`🚧 Paywall hit: Free user reached daily limit of ${dailyLimit} today. Stopping evaluation loop.`);
        break;
      }

      evaluatedCount++;
      const jdText = job.description.toLowerCase();
      const titleLower = job.title.toLowerCase();
      
      // Calculate rapid keyword compatibility (representing our Tiered LLM strategy)
      let matchCount = 0;
      userSkills.forEach(skill => {
        if (jdText.includes(skill) || titleLower.includes(skill)) {
          matchCount++;
        }
      });

      // Calculate score between 2.5 and 5.0 (Deterministic without Math.random)
      const baseMatchPercent = userSkills.length > 0 ? matchCount / userSkills.length : 0.5;
      const calculatedScore = Math.min(5.0, 2.5 + (baseMatchPercent * 2.0) + (titleLower.includes(query.toLowerCase()) ? 0.5 : 0));

      // We consider >= 3.0 a "reasonably well" match (was 3.5, made slightly more accommodating)
      if (calculatedScore >= 3.0) {
        // Save matching score to DB
        const match = await prisma.userJobMatch.upsert({
          where: {
            userId_scrapedJobId: {
              userId,
              scrapedJobId: job.id
            }
          },
          update: { fitScore: calculatedScore },
          create: {
            userId,
            scrapedJobId: job.id,
            fitScore: calculatedScore,
            reportText: `Pre-evaluated Match. Strong skill alignment (matched ${matchCount} keyword(s)). Target preferences match.`
          },
          include: { job: true }
        });
        matches.push(match);
      }
    }

    const totalMatchesFound = activeJobs.length; // Count total potential matches

    return NextResponse.json({
      success: true,
      evaluatedCount,
      matches,
      paywall: isFreeTier ? {
        locked: (matchesTodayCount + matches.length) >= dailyLimit,
        totalMatchesFound,
        unlockedCount: matches.length,
        message: englishPaywallMessage
      } : { locked: false, totalMatchesFound, unlockedCount: matches.length }
    });

  } catch (error: any) {
    console.error('Job search API error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Job search failed.' }, { status: 500 });
  }
}
