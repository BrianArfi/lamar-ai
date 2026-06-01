import { cookies } from 'next/headers';
import prisma from './db';

// Native Web Crypto API SHA-256 password hashing (works fully offline & natively)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'career-ops-salt-key-2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Get the currently authenticated userId (with automatic backward-compatible fallback)
export async function getSessionUser(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    if (sessionCookie && sessionCookie.value) {
      // Look up user in SQLite to ensure they exist
      const user = await prisma.user.findUnique({
        where: { id: sessionCookie.value }
      });
      if (user) return user.id;
    }
  } catch (err) {
    console.error("Session retrieval failed, falling back:", err);
  }
  
  // Backwards-compatible fallback
  return 'default-user-id';
}
