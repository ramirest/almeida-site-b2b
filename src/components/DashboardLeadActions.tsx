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
      <div className="flex gap-2">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex-1 md:flex-none px-3 py-2 text-sm font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
          title="Visualizar Detalhes"
        >

          <CheckCircle size={16} />
          <span className="hidden sm:inline">Aprovar</span>
        </button>
      </div>

      <LeadBudgetModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        lead={lead} 
        budget={budget} 
      />
    </>
  );
}
