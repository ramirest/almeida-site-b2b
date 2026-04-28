'use server';

import { auth, prisma } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function getAllOrders() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Acesso negado');

  return await prisma.order.findMany({
    include: {
      partner: true,
      items: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateOrderStatus(orderId: string, newStatus: string) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Acesso negado');

  const validStatuses = ['PENDING', 'IN_PRODUCTION', 'READY_FOR_DELIVERY', 'COMPLETED', 'DELIVERED', 'CANCELLED'];
  if (!validStatuses.includes(newStatus)) throw new Error('Status inválido');

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus }
  });

  revalidatePath('/admin/pedidos');
  revalidatePath('/admin'); // Revalida o dashboard também
  
  return order;
}

export async function updateOrderDeliveryDate(orderId: string, deliveryDate: Date) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Acesso negado');

  const order = await prisma.order.update({
    where: { id: orderId },
    data: { deliveryDate }
  });

  revalidatePath('/admin/pedidos');
  
  return order;
}
