import { NextResponse } from 'next/server';
import prisma from '../../lib/db';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenParam = searchParams.get('token');
    const listAll = searchParams.get('list') === 'true';

    let userId: string | null = null;

    // 1. Try Token Auth (for Extension)
    if (tokenParam) {
      const user = await prisma.user.findUnique({
        where: { syncToken: tokenParam },
        select: { id: true }
      });
      if (user) {
        userId = user.id;
      }
    }

    // 2. Try Header Auth
    if (!userId) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        const user = await prisma.user.findUnique({
          where: { syncToken: token },
          select: { id: true }
        });
        if (user) {
          userId = user.id;
        }
      }
    }

    // 3. Try Session Cookie (for web app)
    if (!userId) {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('session');
      if (sessionCookie && sessionCookie.value) {
        userId = sessionCookie.value;
      }
    }

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    if (listAll) {
      // Fetch all resumes (Master + Tailored in Applications)
      const resumes = await prisma.resume.findMany({
        where: { userId }
      });

      // Also get tailored CVs from Applications to allow selecting them
      const appsWithTailored = await prisma.application.findMany({
        where: { userId, NOT: { tailoredCv: null } },
        select: { id: true, companyName: true, roleTitle: true }
      });

      const list = [
        ...resumes.map(r => ({ id: r.id, name: `${r.versionName} (Master)` })),
        ...appsWithTailored.map(a => ({ id: `app-${a.id}`, name: `Tailored: ${a.roleTitle} at ${a.companyName}` }))
      ];

      return NextResponse.json({ success: true, list });
    }

    // Default behavior: Fetch master CV
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
