'use server';

import { auth, prisma } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function getAdminDashboardData() {
  const session = await auth();

  if (!session || !session.user || session.user.role !== 'ADMIN') {
    throw new Error('Acesso negado');
  }

  // 1. Garantir que existe uma configuração de dashboard
  let config = await prisma.dashboardConfig.findFirst();
  if (!config) {
    config = await prisma.dashboardConfig.create({
      data: { monthlySalesGoal: 50000 }
    });
  }

  const now = new Date();
  const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayWeek = new Date(now);
  firstDayWeek.setDate(now.getDate() - now.getDay()); // Início da semana (Domingo)

  // 2. Vendas do Mês (Soma totalValue onde status != CANCELLED)
  const salesMonthAgg = await prisma.order.aggregate({
    _sum: { totalValue: true },
    where: {
      status: { not: 'CANCELLED' },
      createdAt: { gte: firstDayMonth }
    }
  });

  // 3. Vendas da Semana
  const salesWeekAgg = await prisma.order.aggregate({
    _sum: { totalValue: true },
    where: {
      status: { not: 'CANCELLED' },
      createdAt: { gte: firstDayWeek }
    }
  });

  // 4. Pedidos Pendentes
  const pendingOrdersCount = await prisma.order.count({
    where: { status: 'PENDING' }
  });

  // 5. Leads Pendentes
  const pendingLeadsCount = await prisma.partner.count({
    where: { status: 'PENDING' }
  });

  // 6. Parceiros Ativos (Convertidos)
  const activePartnersCount = await prisma.partner.count({
    where: { status: 'APPROVED' }
  });

  // 7. Leads de Orçamento (Nova tabela Lead)
  const leadsRaw = await prisma.lead.findMany({
    where: { status: 'NEW' },
    include: { budgets: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  // 8. Todos os Pedidos em Andamento
  const ordersRaw = await prisma.order.findMany({
    where: { status: { in: ['PENDING', 'IN_PRODUCTION'] } },
    include: { partner: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  // 9. Parceiros Homologados
  const partnersRaw = await prisma.partner.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return {
    kpis: {
      salesMonth: salesMonthAgg._sum.totalValue || 0,
      salesWeek: salesWeekAgg._sum.totalValue || 0,
      pendingOrders: pendingOrdersCount,
      pendingLeads: pendingLeadsCount,
      activePartners: activePartnersCount,
      salesGoal: config.monthlySalesGoal
    },
    leads: leadsRaw.map(lead => ({
      id: lead.id,
      budgetId: lead.budgets[0]?.id || '',
      empresa: lead.name,
      servico: 'Ver Orçamento',
      volume: lead.budgets[0] ? `R$ ${lead.budgets[0].totalValue}` : 'Sem Orçamento',
      data: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(lead.createdAt),
      status: 'Novo'
    })),
    pedidos: ordersRaw.map(order => ({
      id: order.id,
      parceiro: order.partner?.corporateName || 'Venda Direta (Avulso)',
      valor: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalValue),
      status: order.status
    })),
    parceiros: partnersRaw.map(partner => ({
      nome: partner.corporateName,
      cnpj: partner.cnpj,
      nivel: partner.tier === 'GOLD' ? 'Ouro' : partner.tier === 'DISTRIBUTOR' ? 'Distribuidor' : 'Padrão',
      credit: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(partner.creditLimit)
    }))
  };
}

export async function approvePartner(partnerId: string) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    throw new Error('Acesso negado');
  }

  await prisma.partner.update({
    where: { id: partnerId },
    data: { status: 'APPROVED' }
  });

  revalidatePath('/admin');
}

export async function updateOrderStatus(orderId: string, status: string) {
  const session = await auth();
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    throw new Error('Acesso negado');
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status }
  });

  revalidatePath('/admin');
}
