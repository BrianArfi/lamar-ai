import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  const res = await prisma.scrapedJob.findMany({
    where: {
      OR: [
        { title: { contains: 'keuangan' } },
        { description: { contains: 'keuangan' } }
      ]
    }
  });
  console.log('Total Keuangan Matches in DB:', res.length);
  if (res.length > 0) {
    console.log('Sample titles:', res.map(j => j.title));
  }
  await prisma.$disconnect();
}

run();
