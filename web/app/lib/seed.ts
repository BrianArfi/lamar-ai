import prisma from './db';
import { cookies } from 'next/headers';

/**
 * Ensures a default user exists in the database for zero-config local prototyping.
 * Automatically seeds profile, master CV, and sample tracker applications.
 */
export async function ensureDefaultUser(): Promise<string> {
  const defaultUserId = 'default-user-id';
  
  // Try to resolve the active logged-in session user ID dynamically
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    if (sessionCookie && sessionCookie.value) {
      const user = await prisma.user.findUnique({
        where: { id: sessionCookie.value }
      });
      if (user) return user.id;
    }
  } catch (e) {
    // Gracefully catch next/headers errors outside Next.js request context (e.g. CLI run)
  }
  
  try {
    // 1. Check if default user already exists
    const existingUser = await prisma.user.findUnique({
      where: { id: defaultUserId }
    });

    if (existingUser) return defaultUserId;

    console.log("🌱 Database is empty. Seeding default SaaS user data...");

    // 2. Create default user profile (neutral)
    await prisma.user.create({
      data: {
        id: defaultUserId,
        fullName: 'Demo User',
        email: 'demo@career-ops.local',
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
        targetRoles: JSON.stringify(['Software Engineer', 'Applied AI Engineer']),
        onboardingComplete: true
      }
    });

    // 3. Create a master CV entry (neutral)
    await prisma.resume.create({
      data: {
        userId: defaultUserId,
        versionName: 'Master CV',
        isMaster: true,
        skills: JSON.stringify(['Node.js', 'TypeScript', 'React', 'Next.js', 'PostgreSQL', 'Docker', 'Git']),
        cvMarkdown: `# Demo User
**Target Role:** Software Engineer

### Experience
* **Software Developer at TechCorp (2024 - Present)**
  - Developed responsive frontends using Next.js, React, and Tailwind CSS.
  - Engineered robust backend APIs with Node.js and PostgreSQL.
  - Managed container deployments using Docker.

* **Junior Developer at StartupInc (2022 - 2024)**
  - Built and maintained REST APIs and automated unit tests.
  - Resolved performance bottleneck issues across PostgreSQL databases.
`
      }
    });

    // 4. Create initial sample job applications
    await prisma.application.createMany({
      data: [
        {
          userId: defaultUserId,
          companyName: 'Acme Corp',
          roleTitle: 'Software Engineer',
          status: 'Evaluated',
          fitScore: 4.50,
          notes: 'High compatibility match. Strong alignment on Next.js, React, and REST APIs.'
        },
        {
          userId: defaultUserId,
          companyName: 'BetaTech',
          roleTitle: 'Frontend Engineer',
          status: 'Interview',
          fitScore: 4.10,
          notes: 'Technical panel scheduled. Resume tailored to highlight React ecosystem expertise.'
        },
        {
          userId: defaultUserId,
          companyName: 'Alpha Solutions',
          roleTitle: 'Full Stack Developer',
          status: 'Applied',
          fitScore: 3.80,
          notes: 'CV sent. Gaps: direct experience with cloud providers.'
        }
      ]
    });

    console.log("🌱 Seeding successfully completed!");
    return defaultUserId;

  } catch (error) {
    console.error("❌ Seeding failed:", error);
    return defaultUserId;
  }
}
export default ensureDefaultUser;
