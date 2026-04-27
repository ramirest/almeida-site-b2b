'use server';

import { auth, prisma } from '@/auth';
import { revalidatePath } from 'next/cache';

export async function getSchedules() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Acesso negado');

  return await prisma.schedule.findMany({
    include: {
      order: {
        include: {
          partner: true,
          items: true
        }
      }
    },
    orderBy: { scheduledAt: 'asc' }
  });
}

export async function getOrdersForScheduling() {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Acesso negado');

  // Buscar pedidos pendentes de agendamento (status não concluído/cancelado e sem agendamento)
  return await prisma.order.findMany({
    where: {
      status: { in: ['PENDING', 'IN_PRODUCTION'] },
      schedule: null
    },
    include: {
      partner: true,
      items: true
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createSchedule(data: { orderId: string, scheduledAt: Date, technician: string, notes: string }) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Acesso negado');

  const schedule = await prisma.schedule.create({
    data: {
      orderId: data.orderId,
      scheduledAt: data.scheduledAt,
      technician: data.technician,
      notes: data.notes
    }
  });

  revalidatePath('/admin/agenda');
  return schedule;
}

export async function completeScheduleAndOrder(scheduleId: string, orderId: string, markOrderDelivered: boolean) {
  const session = await auth();
  if (!session || session.user.role !== 'ADMIN') throw new Error('Acesso negado');

  // Executa as duas atualizações em transação se necessário, ou em sequência
  const schedule = await prisma.schedule.update({
    where: { id: scheduleId },
    data: { status: 'COMPLETED' }
  });

  if (markOrderDelivered) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: 'DELIVERED' }
    });
  }

  revalidatePath('/admin/agenda');
  revalidatePath('/admin/pedidos');
  return schedule;
}
