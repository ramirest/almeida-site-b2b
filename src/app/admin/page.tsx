import React from 'react';
import { Users, ShoppingCart, MessageSquare, TrendingUp, Calendar, Search, MoreVertical } from 'lucide-react';
import { getAdminDashboardData } from '@/actions/admin';
import { ApproveLeadButton, AdvanceOrderButton } from '@/components/AdminActionButtons';

export default async function AdminDashboardPage() {
  const { kpis, leads, pedidos, parceiros } = await getAdminDashboardData();

  const kpisCards = [
    { title: 'Pedidos no Mês', value: kpis.totalOrdersMonth, trend: '+12%', icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: 'Leads Pendentes', value: kpis.pendingLeads, trend: 'Novo', icon: MessageSquare, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Parceiros Ativos', value: kpis.activePartners, trend: '+3%', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Visão Geral do Negócio</h1>
          <p className="text-slate-500">Acompanhe as métricas e gerencie a operação B2B.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar pedidos, CNPJ..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {kpisCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{kpi.title}</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-bold text-slate-900">{kpi.value}</h3>
                  <span className={`text-xs font-bold ${kpi.trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'} flex items-center`}>
                    {kpi.trend.startsWith('+') ? <TrendingUp size={12} className="mr-1" /> : null}
                    {kpi.trend}
                  </span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Leads e Solicitações */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare size={18} className="text-amber-500" />
              Leads de Orçamento
            </h2>
            <button className="text-sm text-blue-600 font-medium hover:underline">Ver todos</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {leads.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Nenhum novo lead de orçamento pendente.</p>
            ) : leads.map((lead, idx) => (
              <div key={idx} className="p-4 border border-slate-100 rounded-lg hover:border-blue-200 transition-colors bg-white shadow-sm flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-500">{lead.id.slice(-6).toUpperCase()}</span>
                    <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Novo Lead
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900">{lead.empresa}</h4>
                  <p className="text-sm text-slate-600 truncate max-w-[200px]">{lead.servico} ({lead.volume})</p>
                </div>
                <div className="flex sm:flex-col justify-between items-end gap-2">
                  <span className="text-xs text-slate-500">{lead.data}</span>
                  <ApproveLeadButton partnerId={lead.id} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Todos os Pedidos */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[400px]">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShoppingCart size={18} className="text-blue-500" />
              Pedidos em Andamento
            </h2>
            <button className="text-sm text-blue-600 font-medium hover:underline">Ver todos</button>
          </div>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-medium">Pedido</th>
                  <th className="px-6 py-3 font-medium">Parceiro</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {pedidos.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-slate-500">
                      Nenhum pedido em andamento.
                    </td>
                  </tr>
                ) : pedidos.map((pedido, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{pedido.id.slice(-6).toUpperCase()}</div>
                      <div className="text-xs text-slate-500">{pedido.valor}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{pedido.parceiro}</td>
                    <td className="px-6 py-4 flex items-center justify-end">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        pedido.status === 'IN_PRODUCTION' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {pedido.status === 'IN_PRODUCTION' ? 'Em Produção' : 'Pendente'}
                      </span>
                      <AdvanceOrderButton orderId={pedido.id} currentStatus={pedido.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Parceiros Cadastrados */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users size={18} className="text-emerald-500" />
              Parceiros Homologados
            </h2>
            <button className="text-slate-400 hover:text-slate-600">
              <MoreVertical size={18} />
            </button>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-slate-100">
              {parceiros.map((parceiro, idx) => (
                <li key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <h4 className="font-bold text-slate-900">{parceiro.nome}</h4>
                    <p className="text-xs text-slate-500">CNPJ: {parceiro.cnpj}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-700">{parceiro.nivel}</div>
                    <div className="text-xs text-emerald-600">Limite: {parceiro.credit}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Agenda de Serviços */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-500" />
              Agenda / Expedição
            </h2>
            <button className="text-sm text-indigo-600 font-bold hover:underline">+ Agendar</button>
          </div>
          <div className="p-6 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3">
              <Calendar size={24} />
            </div>
            <p className="text-slate-600 font-medium">Nenhuma coleta agendada para hoje.</p>
            <p className="text-sm text-slate-500 mt-1">A expedição flui conforme as ordens de produção.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
