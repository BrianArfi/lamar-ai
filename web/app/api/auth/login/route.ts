import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { hashPassword } from '../../../lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and Password are required.' }, { status: 400 });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
    }

    // Verify password hash
    const inputHash = await hashPassword(password);
    if (inputHash !== user.passwordHash) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
    }

    // Set secure session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, fullName: user.fullName, email: user.email } 
    });

  } catch (err: any) {
    console.error('Login failed:', err);
    return NextResponse.json({ success: false, error: err.message || 'Login failed.' }, { status: 500 });
  }
}
