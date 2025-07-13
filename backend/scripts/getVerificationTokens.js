import prisma from '../prismaClient.js';

async function main() {
  const tokens = await prisma.verification.findMany({
    select: {
      token: true,
      userId: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5,
  });
  console.log('Recent verification tokens:', tokens);
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
