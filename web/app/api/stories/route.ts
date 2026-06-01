import { NextResponse } from 'next/server';
import prisma from '../../lib/db';
import { ensureDefaultUser } from '../../lib/seed';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userId = await ensureDefaultUser();

    // Fetch all STAR stories for this user
    const stories = await prisma.story.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: stories });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await ensureDefaultUser();
    const { title, starSituation, starTask, starAction, starResult, reflection, archetypeTags } = await request.json();

    if (!title || !starSituation || !starTask || !starAction || !starResult) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title and all STAR sections (Situation, Task, Action, Result) are required.' 
      }, { status: 400 });
    }

    const story = await prisma.story.create({
      data: {
        userId,
        title,
        starSituation,
        starTask,
        starAction,
        starResult,
        reflection: reflection || null,
        archetypeTags: archetypeTags ? (typeof archetypeTags === 'string' ? archetypeTags : JSON.stringify(archetypeTags)) : '[]'
      }
    });

    return NextResponse.json({ success: true, data: story });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
