import { NextResponse } from 'next/server';
import prisma from '../../lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const userId = sessionCookie.value;

    // Fetch master CV
    const resume = await prisma.resume.findFirst({
      where: { userId, isMaster: true }
    });

    if (!resume) {
      return NextResponse.json({ success: false, error: 'Master CV not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: resume });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const userId = sessionCookie.value;
    const { cvMarkdown, skills } = await request.json();

    if (!cvMarkdown) {
      return NextResponse.json({ success: false, error: 'CV Markdown content is required.' }, { status: 400 });
    }

    // Find master resume first
    const masterResume = await prisma.resume.findFirst({
      where: { userId, isMaster: true }
    });

    let resume;
    if (masterResume) {
      resume = await prisma.resume.update({
        where: { id: masterResume.id },
        data: {
          cvMarkdown,
          skills: skills ? JSON.stringify(skills) : masterResume.skills
        }
      });
    } else {
      resume = await prisma.resume.create({
        data: {
          userId,
          versionName: 'Master CV',
          isMaster: true,
          cvMarkdown,
          skills: skills ? JSON.stringify(skills) : '[]'
        }
      });
    }

    return NextResponse.json({ success: true, data: resume });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
