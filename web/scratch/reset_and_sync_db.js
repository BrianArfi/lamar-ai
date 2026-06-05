import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function run() {
  console.log('🧹 Purging ScrapedJob and UserJobMatch tables...');
  await prisma.userJobMatch.deleteMany({});
  await prisma.scrapedJob.deleteMany({});
  console.log('✅ Purged successfully.');

  const tsvPath = path.resolve(process.cwd(), '..', 'data', 'scan-history.tsv');
  console.log(`Reading from: ${tsvPath}`);
  if (!fs.existsSync(tsvPath)) {
    console.error('scan-history.tsv not found!');
    process.exit(1);
  }

  const content = fs.readFileSync(tsvPath, 'utf-8');
  const lines = content.split('\n').filter(Boolean);
  console.log(`Found ${lines.length - 1} rows to sync.`);

  let importedCount = 0;
  for (const line of lines.slice(1)) {
    const cols = line.split('\t');
    if (cols.length < 5) continue;
    const url = cols[0];
    const portal = cols[2];
    const title = cols[3];
    const company = cols[4];
    const status = cols[5];
    const location = cols[6] || 'Remote';

    if (status && (status.includes('expired') || status.includes('blocked') || status.includes('no_apply'))) {
      continue;
    }

    const externalId = `scraped-${crypto.createHash('sha256').update(url).digest('hex')}`;

    await prisma.scrapedJob.upsert({
      where: { externalId },
      update: {
        title,
        company,
        location,
        url,
        platform: portal,
        isActive: true
      },
      create: {
        platform: portal,
        externalId,
        title,
        company,
        location,
        description: `${title} at ${company}. Platform: ${portal}. Explore the original listing details for full qualifications and application instructions.`,
        url,
        isActive: true
      }
    });
    importedCount++;
  }
  console.log(`✅ Success! Synced ${importedCount} scraped jobs to database.`);

  const count = await prisma.scrapedJob.count();
  console.log(`Total jobs currently in DB: ${count}`);

  await prisma.$disconnect();
}

run().catch(console.error);
