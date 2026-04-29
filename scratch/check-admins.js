const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' }
  });
  console.log('Admins encontrados:', admins.map(u => u.email));
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
