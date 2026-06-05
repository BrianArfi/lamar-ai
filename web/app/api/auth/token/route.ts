import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const userId = sessionCookie.value;

    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { syncToken: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Generate token if not exists
    if (!user.syncToken) {
      const newToken = crypto.randomBytes(24).toString('hex');
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { syncToken: newToken },
        select: { syncToken: true }
      });
      return NextResponse.json({ success: true, syncToken: updatedUser.syncToken });
    }

    return NextResponse.json({ success: true, syncToken: user.syncToken });
  } catch (err: any) {
    console.error('Failed to get sync token:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const userId = sessionCookie.value;
    const newToken = crypto.randomBytes(24).toString('hex');

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { syncToken: newToken },
      select: { syncToken: true }
    });

    return NextResponse.json({ success: true, syncToken: updatedUser.syncToken });
  } catch (err: any) {
    console.error('Failed to regenerate sync token:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
