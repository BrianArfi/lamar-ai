import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const userId = sessionCookie.value;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        targetRoles: true,
        onboardingComplete: true
      }
    });

    if (!user) {
      // Clear cookie if user not found in database
      cookieStore.delete('session');
      return NextResponse.json({ success: false, error: 'User session invalid' }, { status: 401 });
    }

    return NextResponse.json({ success: true, user });
  } catch (err: any) {
    console.error('Session validation failed:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
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
    const { targetRoles, onboardingComplete } = await request.json();

    const updateData: any = {};
    if (targetRoles !== undefined) {
      updateData.targetRoles = JSON.stringify(targetRoles);
    }
    if (onboardingComplete !== undefined) {
      updateData.onboardingComplete = onboardingComplete;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        fullName: true,
        email: true,
        targetRoles: true,
        onboardingComplete: true
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err: any) {
    console.error('Session update failed:', err);
    return NextResponse.json({ success: false, error: err.message || 'Failed to update user profile.' }, { status: 500 });
  }
}

