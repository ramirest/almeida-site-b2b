'use server';

import { auth, prisma } from '@/auth';

export async function getAdminDashboardData() {
  const session = await auth();
  
  if (!session || !session.user || session.user.role !== 'ADMIN') {
    throw new Error('Acesso negado');
  }

  // KPIs
  const totalOrdersMonth = await prisma.order.count({
    where: {
      createdAt: {
        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    }
  });

  const pendingLeads = await prisma.partner.count({
    where: { status: 'PENDING' }
  });

  const activePartners = await prisma.partner.count({
    where: { status: 'APPROVED' }
  });

  // Leads de Orçamento (Partners PENDING com seus pedidos)
  const leadsRaw = await prisma.partner.findMany({
    where: { status: 'PENDING' },
    include: { orders: { include: { items: true } } },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  // Todos os Pedidos em Andamento
  const ordersRaw = await prisma.order.findMany({
    where: { status: { in: ['PENDING', 'IN_PRODUCTION'] } },
    include: { partner: true },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  // Parceiros Homologados
  const partnersRaw = await prisma.partner.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  return {
    kpis: {
      totalOrdersMonth,
      pendingLeads,
      activePartners
    },
    leads: leadsRaw.map(lead => ({
      id: lead.id,
      empresa: lead.corporateName,
      servico: lead.orders[0]?.items[0]?.serviceType || 'Múltiplos Serviços',
      volume: lead.orders[0]?.items[0]?.volume || 'Consulte o pedido',
      data: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(lead.createdAt),
      status: 'Novo'
    })),
    pedidos: ordersRaw.map(order => ({
      id: order.id,
      parceiro: order.partner.corporateName,
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
