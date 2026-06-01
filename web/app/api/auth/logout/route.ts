import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete('session');
    
    return NextResponse.json({ success: true, message: 'Logged out successfully.' });
  } catch (err: any) {
    console.error('Logout failed:', err);
    return NextResponse.json({ success: false, error: err.message || 'Logout failed.' }, { status: 500 });
  }
}
