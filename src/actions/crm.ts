'use server';

import { auth, prisma } from '@/auth';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

// --- LEADS ---

export async function getLeads() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Acesso negado');

  return await prisma.lead.findMany({
    include: { budgets: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createLead(data: { name: string; email: string; phone: string; origin?: string }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Acesso negado');

  const lead = await prisma.lead.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      origin: data.origin || 'SITE',
      status: 'NEW'
    }
  });

  revalidatePath('/admin/leads');
  return lead;
}

// --- ORÇAMENTOS ---

export async function getBudgets() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Acesso negado');

  return await prisma.budget.findMany({
    include: { lead: true },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createBudget(data: { leadId: string; totalValue: number; validityDays: number; items: any }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Acesso negado');

  const validity = new Date();
  validity.setDate(validity.getDate() + data.validityDays);

  const budget = await prisma.budget.create({
    data: {
      leadId: data.leadId,
      totalValue: data.totalValue,
      validity,
      items: data.items,
      status: 'DRAFT'
    }
  });

  revalidatePath('/admin/orcamentos');
  return budget;
}

// --- REGRA DE NEGÓCIO: CONVERSÃO ---

export async function approveBudgetAndPromoteToPartner(budgetId: string, partnerData: { cnpj: string; corporateName: string }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Acesso negado');

  const budget = await prisma.budget.findUnique({
    where: { id: budgetId },
    include: { lead: true }
  });

  if (!budget) throw new Error('Orçamento não encontrado');

  // 1. Criar o Parceiro
  const passwordHash = await bcrypt.hash('mudar123', 10); // Senha padrão inicial
  
  const partner = await prisma.partner.create({
    data: {
      corporateName: partnerData.corporateName,
      cnpj: partnerData.cnpj.replace(/\D/g, ''),
      phone: budget.lead.phone,
      status: 'APPROVED',
      users: {
        create: {
          email: budget.lead.email,
          passwordHash,
          role: 'PARTNER'
        }
      }
    }
  });

  // 2. Criar o Pedido baseado no Orçamento
  const order = await prisma.order.create({
    data: {
      partnerId: partner.id,
      totalValue: budget.totalValue,
      status: 'PENDING',
      items: {
        create: (budget.items as any[]).map(item => ({
          serviceType: item.serviceType || 'Serviço Geral',
          volume: item.volume || 'N/A',
          deadline: 'A Combinar',
          notes: item.notes || ''
        }))
      }
    }
  });

  // 3. Atualizar Status do Lead e do Orçamento
  await prisma.budget.update({
    where: { id: budgetId },
    data: { 
      status: 'APPROVED',
      convertedToOrderId: order.id
    }
  });

  await prisma.lead.update({
    where: { id: budget.leadId },
    data: { status: 'CONVERTED' }
  });

  revalidatePath('/admin/leads');
  revalidatePath('/admin/orcamentos');
  revalidatePath('/admin'); // Dashboard

  return { partnerId: partner.id, orderId: order.id };
}
