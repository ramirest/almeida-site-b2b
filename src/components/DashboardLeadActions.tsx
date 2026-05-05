'use client';

import React, { useState } from 'react';
import { CheckCircle, Eye } from 'lucide-react';
import { LeadBudgetModal } from '@/components/LeadBudgetModal';

export function DashboardLeadActions({ lead }: { lead: any }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Reconstruímos a estrutura de budget esperada pelo modal
  const budget = {
    id: lead.budgetId,
    totalValue: lead.budgetTotal,
    items: lead.budgetItems
  };

  return (
    <>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex-1 md:flex-none px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
          title="Aprovar e Gerar Pedido"
        >
          <CheckCircle size={16} />
          <span className="hidden sm:inline">Aprovar e Gerar Pedido</span>
        </button>

      <LeadBudgetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        lead={lead} 
        budget={budget} 
      />
    </>
  );
}
