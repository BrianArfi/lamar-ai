import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const count = await prisma.scrapedJob.count();
  console.log(`Total jobs in database: ${count}`);

  const activeCount = await prisma.scrapedJob.count({
    where: { isActive: true }
  });
  console.log(`Active jobs: ${activeCount}`);

  const sample = await prisma.scrapedJob.findMany({
    take: 5
  });
  console.log('Sample of 5 jobs:', JSON.stringify(sample, null, 2));

  await prisma.$disconnect();
}

run();
