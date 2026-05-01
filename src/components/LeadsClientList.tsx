'use client';

import React, { useState } from 'react';
import { Mail, Phone, Eye, CheckCircle } from 'lucide-react';
import { LeadBudgetModal } from '@/components/LeadBudgetModal';

type LeadWithRelations = any;

export function LeadsClientList({ initialLeads }: { initialLeads: LeadWithRelations[] }) {
  const [selectedLead, setSelectedLead] = useState<LeadWithRelations | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const openModal = (lead: LeadWithRelations) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 font-medium">Nome / Empresa</th>
              <th className="px-6 py-4 font-medium">Contato</th>
              <th className="px-6 py-4 font-medium">Orçamento Estimado</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {initialLeads.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  Nenhum lead encontrado.
                </td>
              </tr>
            ) : initialLeads.map((lead) => {
              const budget = lead.budgets?.[0];
              const isNew = lead.status === 'NEW';
              
              return (
                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{lead.name}</div>
                    <div className="text-xs text-slate-500">Origem: {lead.origin}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail size={14} className="text-slate-400" />
                      {lead.email}
                    </div>
                    <div className="flex items-center gap-2 text-slate-600 mt-1">
                      <Phone size={14} className="text-slate-400" />
                      {lead.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {budget ? (
                      <div className="font-bold text-slate-900">{formatCurrency(budget.totalValue)}</div>
                    ) : (
                      <span className="text-slate-400 text-xs italic">Sem orçamento</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        lead.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                        lead.status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                      {lead.status === 'NEW' ? 'Aguardando' :
                       lead.status === 'CONVERTED' ? 'Convertido' : lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => openModal(lead)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                        title="Visualizar Orçamento"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {isNew && budget && (
                        <button 
                          onClick={() => openModal(lead)}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" 
                          title="Aprovar e Gerar Pedido"
                        >
                          <CheckCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <LeadBudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        lead={selectedLead}
        budget={selectedLead?.budgets?.[0]}
      />
    </div>
  );
}
