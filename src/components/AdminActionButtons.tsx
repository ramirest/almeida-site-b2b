'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { approvePartner } from '@/actions/admin';
import { updateOrderStatus } from '@/actions/orders';

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

  if (currentStatus === 'COMPLETED' || currentStatus === 'CANCELLED' || currentStatus === 'DELIVERED') return null;

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



export function OrderStatusSelect({ orderId, currentStatus }: { orderId: string, currentStatus: string }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsPending(true);
    try {
      await updateOrderStatus(orderId, e.target.value);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <select 
      value={currentStatus} 
      onChange={handleStatusChange} 
      disabled={isPending}
      className={`text-xs font-medium px-2 py-1.5 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50
        ${currentStatus === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
          currentStatus === 'IN_PRODUCTION' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
          currentStatus === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
          currentStatus === 'DELIVERED' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
          'bg-slate-50 text-slate-700 border-slate-200'
        }`}
    >
      <option value="PENDING">Pendente</option>
      <option value="IN_PRODUCTION">Em Produção</option>
      <option value="COMPLETED">Finalizado</option>
      <option value="DELIVERED">Entregue</option>
      <option value="CANCELLED">Cancelado</option>
    </select>
  );
}

import { updatePartnerStatus } from '@/actions/partners';

export function PartnerStatusSelect({ partnerId, currentStatus }: { partnerId: string, currentStatus: string }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIsPending(true);
    try {
      await updatePartnerStatus(partnerId, e.target.value);
      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <select 
      value={currentStatus} 
      onChange={handleStatusChange} 
      disabled={isPending}
      className={`text-xs font-bold px-3 py-1.5 rounded border focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50
        ${currentStatus === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
          currentStatus === 'BLOCKED' ? 'bg-rose-50 text-rose-700 border-rose-200' : 
          'bg-amber-50 text-amber-700 border-amber-200'
        }`}
    >
      <option value="APPROVED">Ativo / Aprovado</option>
      <option value="PENDING">Pendente</option>
      <option value="BLOCKED">Bloqueado</option>
    </select>
  );
}
