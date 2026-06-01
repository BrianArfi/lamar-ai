import { NextResponse } from 'next/server';
import prisma from '../../../lib/db';
import { hashPassword } from '../../../lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { fullName, email, password } = await request.json();

    if (!fullName || !email || !password) {
      return NextResponse.json({ success: false, error: 'Full Name, Email, and Password are required.' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json({ success: false, error: 'Email already registered.' }, { status: 409 });
    }

    // Hash password using native SHA-256 Web Crypto
    const passwordHash = await hashPassword(password);

    // Create user
    const newUser = await prisma.user.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        passwordHash,
        locationPolicy: JSON.stringify({
          always_allow: ['remote'],
          allow: [],
          block: []
        }),
        salaryTarget: JSON.stringify({
          min: 0,
          max: 0,
          currency: 'USD'
        }),
        onboardingComplete: false
      }
    });

    // Set secure HTTP-only session cookie
    const cookieStore = await cookies();
    cookieStore.set('session', newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return NextResponse.json({ success: true, user: { id: newUser.id, fullName: newUser.fullName, email: newUser.email } });

  } catch (err: any) {
    console.error('Registration failed:', err);
    return NextResponse.json({ success: false, error: err.message || 'Registration failed.' }, { status: 500 });
  }
}
