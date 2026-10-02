import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { email: 'test@test.com' },
    data: { 
      xp: 0,
      streak: 0,
      level: 1,
      title: 'Shell Novice'
    }
  });
  console.log('Reset user stats to 0');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
