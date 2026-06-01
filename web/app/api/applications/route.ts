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

    // Fetch all applications linked to this user
    const applications = await prisma.application.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: applications });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const userId = sessionCookie.value;
    const { companyName, roleTitle, status, fitScore, jobUrl, notes } = await request.json();

    if (!companyName || !roleTitle || fitScore === undefined) {
      return NextResponse.json({ success: false, error: 'Company Name, Role Title, and Fit Score are required.' }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        userId,
        companyName,
        roleTitle,
        status: status || 'Evaluated',
        fitScore: parseFloat(fitScore),
        jobUrl,
        notes
      }
    });

    return NextResponse.json({ success: true, data: application });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
