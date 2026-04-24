const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Gerando massa de dados para o novo CRM (Leads e Orçamentos)...');

  const randomSuffix = Math.floor(Math.random() * 10000);
  const email = `oportunidade${randomSuffix}@cliente.com.br`;

  // 1. Criar o Lead na nova tabela
  const lead = await prisma.lead.create({
    data: {
      name: `Construtora Horizonte ${randomSuffix}`,
      email: email,
      phone: '(11) 98888-7777',
      origin: 'SITE',
      status: 'NEW'
    }
  });

  // 2. Criar um Orçamento para esse Lead
  const budget = await prisma.budget.create({
    data: {
      leadId: lead.id,
      totalValue: 4500.00,
      validity: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 dias
      status: 'DRAFT',
      items: [
        {
          serviceType: 'Jateamento Fachada Completa',
          volume: '50m2',
          notes: 'Vidros laminados 10mm'
        }
      ]
    }
  });

  console.log('--- SUCESSO ---');
  console.log(`Lead Criado: ${lead.name}`);
  console.log(`Orçamento gerado: R$ ${budget.totalValue}`);
  console.log(`Email para teste: ${email}`);
  console.log('Agora verifique as abas "Leads & CRM" e "Orçamentos" no Admin.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
