'use client';

import React, { useState } from 'react';
import { approvePartner, updateOrderStatus } from '@/actions/admin';

export function ApproveLeadButton({ partnerId }: { partnerId: string }) {
  const [isPending, setIsPending] = useState(false);

  const handleApprove = async () => {
    setIsPending(true);
    try {
      await approvePartner(partnerId);
      // O revalidatePath recarregará a página automaticamente
    } catch (error) {
      console.error(error);
      setIsPending(false);
    }
  };

  return (
    <button 
      onClick={handleApprove}
      disabled={isPending}
      className="text-sm font-medium text-blue-600 hover:underline disabled:opacity-50 disabled:no-underline"
    >
      {isPending ? 'Aprovando...' : 'Aprovar Parceiro'}
    </button>
  );
}

export function AdvanceOrderButton({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [isPending, setIsPending] = useState(false);

  const handleAdvance = async () => {
    setIsPending(true);
    try {
      const nextStatus = currentStatus === 'PENDING' ? 'IN_PRODUCTION' : 'COMPLETED';
      await updateOrderStatus(orderId, nextStatus);
    } catch (error) {
      console.error(error);
      setIsPending(false);
    }
  };

  if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED') return null;

  return (
    <button 
      onClick={handleAdvance}
      disabled={isPending}
      className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded disabled:opacity-50 transition-colors ml-4"
    >
      {isPending ? 'Atualizando...' : currentStatus === 'PENDING' ? 'Mandar p/ Produção' : 'Concluir Pedido'}
    </button>
  );
}
