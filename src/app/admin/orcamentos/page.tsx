import React from 'react';
import { FileText, Calendar, CheckCircle, ArrowRight, Download } from 'lucide-react';
import { getBudgets } from '@/actions/crm';

export default async function BudgetsPage() {
  const budgets = await getBudgets();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gestão de Orçamentos</h1>
        <p className="text-slate-500">Acompanhe e converta orçamentos em pedidos reais.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {budgets.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-dashed border-slate-300 text-center text-slate-400">
            Nenhum orçamento emitido ainda.
          </div>
        ) : budgets.map((budget) => (
          <div key={budget.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row justify-between gap-6 hover:border-blue-300 transition-colors">
            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Orçamento #{budget.id.slice(-6).toUpperCase()}</h3>
                  <p className="text-sm text-slate-500">Lead: {budget.lead.name}</p>
                </div>
                <span className={`ml-auto md:ml-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  budget.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {budget.status === 'APPROVED' ? 'Aprovado' : 'Aguardando'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Valor Total</p>
                  <p className="text-lg font-bold text-slate-900">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.totalValue)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Validade</p>
                  <div className="flex items-center gap-1 text-slate-600 text-sm">
                    <Calendar size={14} />
                    {new Date(budget.validity).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-row md:flex-col justify-end gap-2 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
              <button className="flex-1 md:flex-none px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                <Download size={16} />
                Baixar PDF
              </button>
              {budget.status !== 'APPROVED' && (
                <button className="flex-1 md:flex-none px-4 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle size={16} />
                  Aprovar e Gerar Pedido
                </button>
              )}
              {budget.status === 'APPROVED' && budget.convertedToOrderId && (
                <div className="text-emerald-600 text-xs font-medium flex items-center gap-1 justify-center py-2">
                  <CheckCircle size={14} />
                  Pedido #{budget.convertedToOrderId.slice(-6).toUpperCase()} Gerado
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
