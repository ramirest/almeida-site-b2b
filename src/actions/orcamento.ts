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

    // 1. Verifica se o parceiro já existe pelo CNPJ
    let partner = await prisma.partner.findUnique({
      where: { cnpj: cnpjClean }
    });

    // 2. Se não existir, cria como PENDING (Lead B2B)
    if (!partner) {
      // Senha padrão para novos Leads (devem trocar no primeiro acesso)
      const defaultPassword = 'mudar123';
      const passwordHash = await bcrypt.hash(defaultPassword, 10);

      partner = await prisma.partner.create({
        data: {
          corporateName: formData.empresa,
          cnpj: cnpjClean,
          phone: formData.telefone,
          status: 'PENDING',
          users: {
            create: {
              email: formData.email,
              passwordHash,
              role: 'PARTNER'
            }
          }
        }
      });
    }

    // 3. Cria o Pedido (Order) vinculado a este Partner
    const order = await prisma.order.create({
      data: {
        partnerId: partner.id,
        status: 'PENDING',
        totalValue: formData.totalEstimate,
        items: {
          create: formData.items.map(item => ({
            serviceType: item.type,
            volume: item.volume,
            deadline: item.prazo || 'A Combinar',
            notes: item.notes
          }))
        }
      }
    });

    return { success: true, orderId: order.id, partnerStatus: partner.status };
  } catch (error) {
    console.error('Erro ao submeter orçamento:', error);
    return { success: false, error: 'Ocorreu um erro ao processar o orçamento.' };
  }
}
