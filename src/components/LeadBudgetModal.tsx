'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { approveBudgetAndPromoteToPartner, updateBudget } from '@/actions/crm';
import { calculateServicePrice, COLOR_OPTIONS, getBillableMeasure } from '@/config/pricing';

interface LeadBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: any; // O objeto do lead
  budget: any; // O objeto do budget (ou detalhes do budget caso mapeado)
  onSuccess?: () => void;
}

export function LeadBudgetModal({ isOpen, onClose, lead, budget, onSuccess }: LeadBudgetModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const [editTotalValue, setEditTotalValue] = useState(0);
  const [editServices, setEditServices] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && budget) {
      setEditTotalValue(budget.totalValue || budget.budgetTotal || 0);
      const itemsJson = budget.items || budget.budgetItems || [];
      const servicesArray = Array.isArray(itemsJson) ? itemsJson : (itemsJson.services || []);
      setEditServices(servicesArray);
      setFeedback(null);
    }
  }, [isOpen, budget]);

  const handleRecalculate = () => {
    let newTotal = 0;
    editServices.forEach(svc => {
      if (svc.serviceId) {
        newTotal += calculateServicePrice({
          serviceId: svc.serviceId,
          colorId: svc.colorId,
          width: parseFloat(svc.width) || 0,
          height: parseFloat(svc.height) || 0,
          quantity: parseInt(svc.quantity) || 1,
          includeAdditionalCosts: true
        });
      }
    });
    if (newTotal > 0) {
      setEditTotalValue(newTotal);
    }
  };

  if (!isOpen || !lead || !budget) return null;

  const handleAction = async (actionType: 'save' | 'save_and_approve') => {
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const budgetId = budget.id || budget.budgetId;
      if (!budgetId) throw new Error('Orçamento não encontrado');

      const itemsJson = budget.items || budget.budgetItems || {};
      const newItems = Array.isArray(itemsJson) 
        ? editServices 
        : { ...itemsJson, services: editServices };

      // 1. Sempre salvar as alterações
      await updateBudget(budgetId, {
        totalValue: editTotalValue,
        items: newItems
      });

      // 2. Se for para aprovar, converter o lead
      if (actionType === 'save_and_approve') {
        const originalCnpj = itemsJson?.clientData?.cnpj || `00000${Math.floor(Math.random() * 1000000000)}`.slice(-14);
        
        await approveBudgetAndPromoteToPartner(budgetId, {
          cnpj: originalCnpj,
          corporateName: lead.name || lead.empresa
        });

        setFeedback({ 
          type: 'success', 
          message: `Orçamento Salvo e Aprovado!\n\nSe o cliente ainda não era parceiro, o sistema gerou um acesso automático:\nLogin (CNPJ): ${originalCnpj}\nSenha Padrão: mudar123\n\n(Copie esses dados e envie ao cliente)` 
        });
      } else {
        setFeedback({ type: 'success', message: 'Orçamento atualizado com sucesso!' });
      }

      // IMPORTANTE: Removemos o fechamento automático para dar tempo de leitura
    } catch (error: any) {
      console.error(error);
      setFeedback({ type: 'error', message: error.message || 'Ocorreu um erro ao processar o orçamento.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAfterSuccess = () => {
    onClose();
    if (onSuccess) onSuccess();
    else window.location.reload();
  };

  const copyCredentials = () => {
    if (feedback?.message) {
      navigator.clipboard.writeText(feedback.message);
      alert('Dados copiados para a área de transferência!');
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSubmitting && onClose()}
      title={`Detalhes do Orçamento - ${lead.name || lead.empresa}`}
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-500 uppercase">Valor Total Negociado (R$)</label>
            <button 
              type="button" 
              onClick={handleRecalculate}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
              title="Recalcular com base na tabela de preços atual"
            >
              <RefreshCw size={12} /> Recalcular Automático
            </button>
          </div>
          <input 
            type="number" 
            step="0.01"
            value={editTotalValue}
            onChange={(e) => setEditTotalValue(Number(e.target.value))}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-bold text-blue-700 text-lg"
            required
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Serviços e Metragem</label>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
            {editServices.map((svc, idx) => (
              <div key={idx} className="p-3 border border-slate-200 rounded-lg bg-slate-50 space-y-2">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={svc.serviceName || svc.type || svc.serviceType || ''} 
                    onChange={(e) => {
                      const newSvcs = [...editServices];
                      newSvcs[idx] = { ...newSvcs[idx], serviceName: e.target.value };
                      setEditServices(newSvcs);
                    }}
                    className="flex-1 px-2 py-1 text-sm font-bold border rounded outline-none"
                    placeholder="Serviço"
                  />
                  {svc.reference && (
                    <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold whitespace-nowrap flex items-center">
                      Ref: {svc.reference}
                    </span>
                  )}
                  {svc.colorId && svc.colorId !== 'nenhuma' && (
                    <select 
                      value={svc.colorId}
                      onChange={(e) => {
                        const newSvcs = [...editServices];
                        newSvcs[idx] = { ...newSvcs[idx], colorId: e.target.value };
                        setEditServices(newSvcs);
                      }}
                      className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-bold outline-none cursor-pointer border-none"
                    >
                      {COLOR_OPTIONS.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  )}
                </div>
                
                <div className="flex gap-2 items-center flex-wrap mt-2">
                  {svc.width !== undefined && (
                    <div className="flex flex-col gap-1 flex-1 min-w-[80px]">
                      <div className="flex items-center bg-white border rounded overflow-hidden">
                        <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 border-r font-medium whitespace-nowrap">Larg Real (m)</span>
                        <input 
                          type="text" 
                          value={svc.width || ''} 
                          onChange={(e) => {
                            const newSvcs = [...editServices];
                            newSvcs[idx] = { ...newSvcs[idx], width: e.target.value };
                            setEditServices(newSvcs);
                          }}
                          className="w-full px-2 py-1 text-xs outline-none"
                          placeholder="Ex: 2.5"
                        />
                      </div>
                      {parseFloat(svc.width) > 0 && (
                        <div className="text-[10px] text-emerald-600 font-medium px-1">
                          Cobrança: {getBillableMeasure(parseFloat(svc.width)).toFixed(2)}m
                        </div>
                      )}
                    </div>
                  )}
                  {svc.height !== undefined && (
                    <div className="flex flex-col gap-1 flex-1 min-w-[80px]">
                      <div className="flex items-center bg-white border rounded overflow-hidden">
                        <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 border-r font-medium whitespace-nowrap">Alt Real (m)</span>
                        <input 
                          type="text" 
                          value={svc.height || ''} 
                          onChange={(e) => {
                            const newSvcs = [...editServices];
                            newSvcs[idx] = { ...newSvcs[idx], height: e.target.value };
                            setEditServices(newSvcs);
                          }}
                          className="w-full px-2 py-1 text-xs outline-none"
                          placeholder="Ex: 1.2"
                        />
                      </div>
                      {parseFloat(svc.height) > 0 && (
                        <div className="text-[10px] text-emerald-600 font-medium px-1">
                          Cobrança: {getBillableMeasure(parseFloat(svc.height)).toFixed(2)}m
                        </div>
                      )}
                    </div>
                  )}
                  {svc.quantity !== undefined && (
                    <div className="flex items-center bg-white border rounded overflow-hidden flex-1 min-w-[80px]">
                      <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 border-r font-medium">Qtd</span>
                      <input 
                        type="text" 
                        value={svc.quantity || ''} 
                        onChange={(e) => {
                          const newSvcs = [...editServices];
                          newSvcs[idx] = { ...newSvcs[idx], quantity: e.target.value };
                          setEditServices(newSvcs);
                        }}
                        className="w-full px-2 py-1 text-xs outline-none"
                      />
                    </div>
                  )}
                  <div className="flex items-center bg-white border rounded overflow-hidden flex-1 min-w-[120px]">
                    <span className="bg-slate-100 text-slate-500 text-xs px-2 py-1 border-r font-medium">Prazo</span>
                    <input 
                      type="text" 
                      value={svc.prazo || svc.deadline || ''} 
                      onChange={(e) => {
                        const newSvcs = [...editServices];
                        newSvcs[idx] = { ...newSvcs[idx], prazo: e.target.value };
                        setEditServices(newSvcs);
                      }}
                      className="w-full px-2 py-1 text-xs outline-none"
                      placeholder="Ex: Urgente"
                    />
                  </div>
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
            {editServices.length === 0 && (
              <p className="text-xs text-slate-500 italic">Nenhum serviço detalhado no orçamento.</p>
            )}
          </div>
        </div>

        {feedback && (
          <div className={`p-3 rounded-lg flex items-start gap-2 text-sm whitespace-pre-wrap ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {feedback.type === 'success' ? <CheckCircle size={16} className="mt-0.5" /> : <AlertCircle size={16} className="mt-0.5" />}
            {feedback.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-slate-100">
          {feedback?.type === 'success' ? (
            <>
              <button 
                onClick={copyCredentials}
                className="px-4 py-2 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all"
              >
                Copiar Dados
              </button>
              <button 
                onClick={handleCloseAfterSuccess}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all"
              >
                OK, Entendido
              </button>
            </>
          ) : (
            <>
              <button 
                type="button" 
                onClick={() => handleAction('save')}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-all disabled:opacity-50"
              >
                Apenas Salvar
              </button>
              <button 
                onClick={() => handleAction('save_and_approve')}
                disabled={isSubmitting}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <CheckCircle size={16} />
                {isSubmitting ? 'Processando...' : 'Salvar e Aprovar Pedido'}
              </button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
