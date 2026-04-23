const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Gerando massa de dados para teste de Leads...');

  const passwordHash = await bcrypt.hash('parceiro123', 10);
  const randomSuffix = Math.floor(Math.random() * 10000);

  const partner = await prisma.partner.create({
    data: {
      corporateName: `Vidraçaria Teste ${randomSuffix} Ltda`,
      cnpj: `00000000000${randomSuffix}`.slice(-14),
      phone: '(11) 99999-9999',
      status: 'PENDING',
      users: {
        create: {
          email: `teste${randomSuffix}@vidracaria.com.br`,
          passwordHash,
          role: 'PARTNER'
        }
      },
      orders: {
        create: {
          status: 'PENDING',
          totalValue: 1250.00,
          items: {
            create: [
              {
                serviceType: 'Jateamento em Vidro Temperado',
                volume: '10m2',
                deadline: '5 dias úteis',
                notes: 'Vidro 8mm incolor'
              }
            ]
          }
        }
      }
    }
  });

  console.log(`Sucesso! Lead criado: ${partner.corporateName}`);
  console.log(`Email para login futuro: teste${randomSuffix}@vidracaria.com.br`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
