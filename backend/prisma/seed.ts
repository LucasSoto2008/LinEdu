import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { email: 'mia@test.com', password: '123', name: 'Mia Chen', xp: 8420, streak: 42 },
      { email: 'dev@test.com', password: '123', name: 'Dev Patel', xp: 7900, streak: 38 },
      { email: 'sara@test.com', password: '123', name: 'Sara Kim', xp: 7200, streak: 35 },
      { email: 'test@test.com', password: '123', name: 'Lucas Soto', xp: 3840, streak: 27, level: 14, title: 'Shell Ranger' },
      { email: 'tom@test.com', password: '123', name: 'Tom Wright', xp: 3200, streak: 21 },
      { email: 'ana@test.com', password: '123', name: 'Ana Ruiz', xp: 2900, streak: 18 },
      { email: 'jon@test.com', password: '123', name: 'Jon Blake', xp: 2400, streak: 12 },
    ]
  });
  console.log('Seeded database with users');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
