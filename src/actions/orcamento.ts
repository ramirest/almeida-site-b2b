'use server';

import { prisma } from '@/auth'; // Reutilizando a instância do prisma do auth.ts
import bcrypt from 'bcryptjs';

export async function submitOrcamento(formData: {
  empresa: string;
  cnpj: string;
  nome: string;
  email: string;
  telefone: string;
  items: Array<{ id: string; type: string; volume: string; prazo: string; notes: string }>;
  totalEstimate: number;
}) {
  try {
    const cnpjClean = formData.cnpj.replace(/\D/g, '');

    // 1. Cria o Lead
    const lead = await prisma.lead.create({
      data: {
        name: formData.empresa,
        email: formData.email,
        phone: formData.telefone,
        origin: 'SITE',
        status: 'NEW'
      }
    });

    // Validade padrão: 15 dias
    const validity = new Date();
    validity.setDate(validity.getDate() + 15);

    // 2. Cria o Orçamento vinculado ao Lead
    const budget = await prisma.budget.create({
      data: {
        leadId: lead.id,
        totalValue: formData.totalEstimate,
        validity,
        status: 'DRAFT',
        items: {
          clientData: {
            cnpj: cnpjClean,
            contato: formData.nome
          },
          services: formData.items
        }
      }
    });

    return { success: true, orderId: budget.id, partnerStatus: 'PENDING' };
  } catch (error) {
    console.error('Erro ao submeter orçamento:', error);
    return { success: false, error: 'Ocorreu um erro ao processar o orçamento.' };
  }
}
