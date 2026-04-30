'use server';

import { auth, prisma } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function getAllPartners() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Acesso negado');

  return await prisma.partner.findMany({
    include: {
      users: true,
      orders: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updatePartnerStatus(partnerId: string, newStatus: string) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Acesso negado');

  const validStatuses = ['PENDING', 'APPROVED', 'BLOCKED'];
  if (!validStatuses.includes(newStatus)) throw new Error('Status inválido');

  const partner = await prisma.partner.update({
    where: { id: partnerId },
    data: { status: newStatus }
  });

  revalidatePath('/admin/parceiros');
  
  return partner;
}

export async function updatePartner(partnerId: string, data: { corporateName: string; phone: string; address?: string; creditLimit: number; tier: string }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Acesso negado');

  const partner = await prisma.partner.update({
    where: { id: partnerId },
    data: {
      corporateName: data.corporateName,
      phone: data.phone,
      address: data.address,
      creditLimit: data.creditLimit,
      tier: data.tier
    }
  });

  revalidatePath('/admin/parceiros');
  return partner;
}
