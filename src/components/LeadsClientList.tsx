'use client';

import React, { useState } from 'react';
import { Mail, Phone, Eye, Edit, CheckCircle, FileText, AlertCircle, X } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { approveBudgetAndPromoteToPartner, updateBudget } from '@/actions/crm';

type LeadWithRelations = any;

export function LeadsClientList({ initialLeads }: { initialLeads: LeadWithRelations[] }) {
  const [selectedLead, setSelectedLead] = useState<LeadWithRelations | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'approve' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Estados para edição do orçamento principal
  const [editTotalValue, setEditTotalValue] = useState(0);
  const [editServices, setEditServices] = useState<any[]>([]);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const openModal = (lead: LeadWithRelations, mode: 'view' | 'edit' | 'approve') => {
    setSelectedLead(lead);
    setModalMode(mode);
    setFeedback(null);
    
    if (mode === 'edit' && lead.budgets && lead.budgets.length > 0) {
      const budget = lead.budgets[0];
      setEditTotalValue(budget.totalValue);
      const itemsJson = budget.items as any;
      const servicesArray = Array.isArray(itemsJson) ? itemsJson : (itemsJson.services || []);
      setEditServices(servicesArray);
    }
  };

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !selectedLead.budgets || selectedLead.budgets.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const budget = selectedLead.budgets[0];
      const itemsJson = budget.items as any;
      const newItems = Array.isArray(itemsJson) 
        ? editServices 
        : { ...itemsJson, services: editServices };

      await updateBudget(budget.id, {
        totalValue: editTotalValue,
        items: newItems
      });
      
      setFeedback({ type: 'success', message: 'Orçamento atualizado com sucesso!' });
      setTimeout(() => {
        setModalMode(null);
        window.location.reload(); // Atualiza a lista
      }, 1500);
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro ao atualizar orçamento.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedLead || !selectedLead.budgets || selectedLead.budgets.length === 0) return;
    setIsSubmitting(true);
    try {
      const budget = selectedLead.budgets[0];
      const itemsJson = budget.items as any;
      
      // Tenta extrair o CNPJ que veio do formulário do site, se existir
      const originalCnpj = itemsJson?.clientData?.cnpj || `00000${Math.floor(Math.random() * 1000000000)}`.slice(-14);

      await approveBudgetAndPromoteToPartner(budget.id, {
        cnpj: originalCnpj,
        corporateName: selectedLead.name
      });

      setFeedback({ type: 'success', message: `Orçamento Aprovado!\nParceiro criado com o CNPJ: ${originalCnpj}\nSenha padrão: mudar123` });
      setTimeout(() => {
        setModalMode(null);
        window.location.reload(); // Atualiza a lista para refletir os novos status
      }, 3000);
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro ao converter lead em pedido.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderServiceList = (services: any[]) => (
    <div className="space-y-3">
      {services.map((svc: any, idx: number) => (
        <div key={idx} className="p-3 bg-white border border-slate-100 rounded-lg text-sm">
          <p className="font-bold text-slate-800">{svc.type || svc.serviceType || 'Serviço Geral'}</p>
          <div className="flex gap-4 mt-1 text-slate-600">
            <span className="text-xs">Vol: <span className="font-medium">{svc.volume}</span></span>
            <span className="text-xs">Prazo: <span className="font-medium">{svc.prazo || svc.deadline || 'N/A'}</span></span>
          </div>
          {svc.notes && <p className="text-xs text-slate-500 mt-2 italic bg-slate-50 p-2 rounded">Obs: {svc.notes}</p>}
        </div>
      ))}
    </div>
  );

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
                        onClick={() => openModal(lead, 'view')}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                        title="Ver Detalhes"
                      >
                        <Eye size={18} />
                      </button>
                      
                      {isNew && budget && (
                        <button 
                          onClick={() => openModal(lead, 'edit')}
                          className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" 
                          title="Editar Orçamento"
                        >
                          <Edit size={18} />
                        </button>
                      )}
                      
                      {isNew && budget && (
                        <button 
                          onClick={() => openModal(lead, 'approve')}
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

      {/* Modal View Details */}
      <Modal
        isOpen={modalMode === 'view' && !!selectedLead}
        onClose={() => setModalMode(null)}
        title="Detalhes do Orçamento"
      >
        {selectedLead && selectedLead.budgets?.[0] ? (() => {
          const budget = selectedLead.budgets[0];
          const itemsJson = budget.items as any;
          const servicesArray = Array.isArray(itemsJson) ? itemsJson : (itemsJson.services || []);
          
          return (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg flex justify-between items-center border border-blue-100">
                <span className="text-sm font-bold text-blue-900 uppercase">Valor Total Estimado:</span>
                <span className="text-xl font-black text-blue-700">{formatCurrency(budget.totalValue)}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 border-b pb-2">Serviços Solicitados:</h4>
              <div className="max-h-64 overflow-y-auto bg-slate-50 p-2 rounded-lg">
                {renderServiceList(servicesArray)}
              </div>
            </div>
          );
        })() : (
          <p className="text-center text-slate-500 py-4">Nenhum orçamento vinculado a este lead.</p>
        )}
      </Modal>

      {/* Modal Edit Budget */}
      <Modal
        isOpen={modalMode === 'edit' && !!selectedLead}
        onClose={() => !isSubmitting && setModalMode(null)}
        title="Editar Orçamento"
      >
        <form onSubmit={handleUpdateBudget} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Valor Total (R$)</label>
            <input 
              type="number" 
              step="0.01"
              value={editTotalValue}
              onChange={(e) => setEditTotalValue(Number(e.target.value))}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700 text-lg"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">Ajuste o valor negociado com o cliente antes de aprovar.</p>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Serviços</label>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {editServices.map((svc, idx) => (
                <div key={idx} className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
                  <input 
                    type="text" 
                    value={svc.type || svc.serviceType || ''} 
                    onChange={(e) => {
                      const newSvcs = [...editServices];
                      newSvcs[idx] = { ...newSvcs[idx], type: e.target.value };
                      setEditServices(newSvcs);
                    }}
                    className="w-full px-2 py-1 text-sm border rounded"
                    placeholder="Tipo de Serviço"
                  />
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={svc.volume || ''} 
                      onChange={(e) => {
                        const newSvcs = [...editServices];
                        newSvcs[idx] = { ...newSvcs[idx], volume: e.target.value };
                        setEditServices(newSvcs);
                      }}
                      className="w-1/2 px-2 py-1 text-xs border rounded"
                      placeholder="Volume (m²)"
                    />
                    <input 
                      type="text" 
                      value={svc.prazo || svc.deadline || ''} 
                      onChange={(e) => {
                        const newSvcs = [...editServices];
                        newSvcs[idx] = { ...newSvcs[idx], prazo: e.target.value };
                        setEditServices(newSvcs);
                      }}
                      className="w-1/2 px-2 py-1 text-xs border rounded"
                      placeholder="Prazo"
                    />
                  </div>
                  <textarea 
                    value={svc.notes || ''} 
                    onChange={(e) => {
                      const newSvcs = [...editServices];
                      newSvcs[idx] = { ...newSvcs[idx], notes: e.target.value };
                      setEditServices(newSvcs);
                    }}
                    className="w-full px-2 py-1 text-xs border rounded h-16"
                    placeholder="Observações / Descrição..."
                  />
                </div>
              ))}
            </div>
          </div>

          {feedback && (
            <div className={`p-3 rounded-lg flex items-center gap-2 text-sm whitespace-pre-wrap ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              {feedback.message}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
             <button 
              type="button" 
              onClick={() => setModalMode(null)}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2 bg-amber-500 text-white rounded-lg text-sm font-bold hover:bg-amber-600 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Orçamento'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Approve */}
      <Modal
        isOpen={modalMode === 'approve' && !!selectedLead}
        onClose={() => !isSubmitting && setModalMode(null)}
        title="Aprovar Orçamento e Gerar Pedido"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Tem certeza que deseja aprovar este orçamento e enviá-lo para a fila de produção?
          </p>
          <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-start gap-2">
            <AlertCircle size={16} className="text-amber-600 mt-0.5" />
            <p className="text-xs text-amber-800">
              Isso criará uma conta de Parceiro (se o CNPJ for novo) e um Pedido oficial em "Todos os Pedidos". 
              O status do Lead será alterado para <strong>Convertido</strong>.
            </p>
          </div>

          {feedback && (
            <div className={`p-3 rounded-lg flex items-start gap-2 text-sm whitespace-pre-wrap ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {feedback.type === 'success' ? <CheckCircle size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
              {feedback.message}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setModalMode(null)}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg"
              disabled={isSubmitting || feedback?.type === 'success'}
            >
              Cancelar
            </button>
            <button 
              onClick={handleApprove}
              disabled={isSubmitting || feedback?.type === 'success'}
              className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle size={16} />
              {isSubmitting ? 'Gerando Pedido...' : 'Sim, Aprovar e Gerar Pedido'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
