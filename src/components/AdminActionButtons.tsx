'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { approvePartner, updateOrderStatus } from '@/actions/admin';

export function ApproveLeadButton({ partnerId }: { partnerId: string }) {
  const [isPending, setIsPending] = useState(false);

  const handleApprove = async () => {
    setIsPending(true);
    try {
      await approvePartner(partnerId);
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

import { approveBudgetAndPromoteToPartner } from '@/actions/crm';

export function ApproveCrmLeadButton({ leadId, budgetId, corporateName }: { leadId: string; budgetId: string; corporateName: string }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleApprove = async () => {
    setIsPending(true);
    try {
      const uniqueCnpj = `00000${Math.floor(Math.random() * 1000000000)}`.slice(-14);
      
      await approveBudgetAndPromoteToPartner(budgetId, { 
        cnpj: uniqueCnpj, 
        corporateName 
      });
      
      alert(`Sucesso! Parceiro criado.\nCNPJ para login: ${uniqueCnpj}\nSenha: mudar123`);
      router.refresh();
    } catch (error) {
      console.error(error);
      setIsPending(false);
    }
  };

  return (
    <button 
      onClick={handleApprove}
      disabled={isPending}
      className="flex-1 md:flex-none px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
    >
      <CheckCircle size={16} />
      {isPending ? 'Convertendo...' : 'Aprovar e Gerar Pedido'}
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
