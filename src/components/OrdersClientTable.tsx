'use client';

import React, { useState, useMemo } from 'react';
import { ShoppingCart, Calendar, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { OrderStatusSelect } from '@/components/AdminActionButtons';
import { calculateServicePrice, getBillableMeasure } from '@/config/pricing';
import { getColorPricing } from '@/utils/colorPricing';

type OrderWithRelations = any; // Simplificado para o exemplo, idealmente importe o tipo correto do Prisma

export function OrdersClientTable({ initialOrders }: { initialOrders: OrderWithRelations[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ativos' | 'arquivados'>('ativos');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const ITEMS_PER_PAGE = 10;

  const filteredOrders = useMemo(() => {
    // 1. Filtrar por aba
    const tabFiltered = initialOrders.filter(o => activeTab === 'ativos' ? o.status !== 'DELIVERED' : o.status === 'DELIVERED');
    
    // 2. Filtrar por busca
    if (!searchTerm) return tabFiltered;
    
    const lowerTerm = searchTerm.toLowerCase();
    
    return tabFiltered.filter((order) => {
      const orderIdMatch = order.id.toLowerCase().includes(lowerTerm);
      const partnerMatch = order.partner ? order.partner.corporateName.toLowerCase().includes(lowerTerm) : 'venda direta avulso'.includes(lowerTerm);
      const itemsMatch = order.items.some((item: any) => item.serviceType.toLowerCase().includes(lowerTerm));
      
      // Tradução de status para busca
      const statusMap: Record<string, string> = {
        'PENDING': 'pendente',
        'IN_PRODUCTION': 'em andamento',
        'COMPLETED': 'finalizado',
        'READY_FOR_DELIVERY': 'pronto para entrega',
        'DELIVERED': 'entregue',
        'CANCELLED': 'cancelado'
      };
      const statusText = statusMap[order.status] || order.status.toLowerCase();
      const statusMatch = statusText.includes(lowerTerm);
      
      return orderIdMatch || partnerMatch || itemsMatch || statusMatch;
    });
  }, [initialOrders, searchTerm, activeTab]);

  // Resetar página ao mudar aba ou busca
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE) || 1;
  const currentOrders = filteredOrders.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Todos os Pedidos</h1>
          <p className="text-slate-500">Gerencie a produção e entrega do ecossistema B2B.</p>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('ativos')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'ativos' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Pedidos Ativos
          </button>
          <button 
            onClick={() => setActiveTab('arquivados')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'arquivados' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Arquivados
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end mb-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar pedido, cliente, serviço..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-72 transition-shadow"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Pedido / Data</th>
                <th className="px-6 py-4 font-medium">Parceiro</th>
                <th className="px-6 py-4 font-medium">Itens</th>
                <th className="px-6 py-4 font-medium">Valor Total</th>
                <th className="px-6 py-4 font-medium">Status / Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              ) : currentOrders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                return (
                  <React.Fragment key={order.id}>
                    <tr 
                      className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${activeTab === 'arquivados' ? 'opacity-80' : ''} ${isExpanded ? 'bg-blue-50/20' : ''}`}
                      onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="text-slate-400 hover:text-slate-600">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </span>
                          <ShoppingCart size={14} className="text-slate-400" />
                          #{order.id.slice(-6).toUpperCase()}
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <Calendar size={12} />
                          {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(order.createdAt))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">
                          {order.partner ? order.partner.corporateName : 'Venda Direta (Avulso)'}
                        </div>
                        {order.partner && (
                          <div className="text-xs text-slate-500 mt-1">CNPJ: {order.partner.cnpj}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-600">
                          {order.items.length > 0 ? (
                            <>
                              <span className="font-medium">{order.items[0].serviceType}</span>
                              {order.items.length > 1 && <span className="text-xs ml-1 text-slate-400">(+{order.items.length - 1})</span>}
                            </>
                          ) : (
                            <span className="text-slate-400 italic">Sem itens</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalValue)}
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr className="bg-slate-50/50">
                        <td colSpan={5} className="px-8 py-6 border-b border-slate-200">
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Itens Detalhados do Pedido</h4>
                            <div className="space-y-3">
                              {order.items.map((item: any, idx: number) => {
                                const wRaw = parseFloat(item.width) || 0;
                                const hRaw = parseFloat(item.height) || 0;
                                const isMm = wRaw > 20 || hRaw > 20;
                                const w = isMm ? wRaw / 1000 : wRaw;
                                const h = isMm ? hRaw / 1000 : hRaw;
                                const qty = parseInt(item.quantity) || 1;
                                
                                let colorPrice: number | undefined = undefined;
                                let colorCategory = '';
                                if (item.colorCode) {
                                  const cp = getColorPricing(item.colorCode, item.colorName || '');
                                  colorPrice = cp.price;
                                  colorCategory = cp.category;
                                }

                                const itemPrice = item.serviceId ? calculateServicePrice({
                                  serviceId: item.serviceId,
                                  width: w,
                                  height: h,
                                  quantity: qty,
                                  includeAdditionalCosts: true,
                                  colorPrice
                                }) : 0;

                                return (
                                  <div key={idx} className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm text-sm space-y-3">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <span className="font-bold text-slate-800">{item.serviceType || item.serviceName || 'Serviço'}</span>
                                        {item.reference && (
                                          <span className="ml-2 bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded font-semibold">
                                            Ref: {item.reference}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-right font-bold text-blue-900">
                                        {itemPrice > 0 ? (
                                          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(itemPrice)
                                        ) : (
                                          'Sob Consulta'
                                        )}
                                      </div>
                                    </div>

                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600">
                                      {wRaw > 0 && (
                                        <div>
                                          <span className="font-semibold block text-slate-400">MEDIDA REAL</span>
                                          <span>{wRaw} x {hRaw} mm</span>
                                        </div>
                                      )}
                                      {wRaw > 0 && (
                                        <div>
                                          <span className="font-semibold block text-slate-400">CONVERSÃO / COBRANÇA</span>
                                          <span className="italic">
                                            {getBillableMeasure(w).toFixed(2)}x{getBillableMeasure(h).toFixed(2)}m
                                          </span>
                                        </div>
                                      )}
                                      <div>
                                        <span className="font-semibold block text-slate-400">QUANTIDADE</span>
                                        <span>{qty} peça{qty > 1 ? 's' : ''}</span>
                                      </div>
                                      {item.deadline && (
                                        <div>
                                          <span className="font-semibold block text-slate-400">PRAZO DESEJADO</span>
                                          <span>{item.deadline}</span>
                                        </div>
                                      )}
                                    </div>

                                    {item.colorCode && (
                                      <div className="text-xs bg-primary/5 border-l-2 border-primary p-2 rounded-r-md">
                                        <div className="flex gap-4">
                                          <div>
                                            <span className="font-semibold text-slate-500">Cor:</span> {item.colorCode} {item.colorName && `(${item.colorName})`}
                                          </div>
                                          <div>
                                            <span className="font-semibold text-slate-500">Categoria:</span> {colorCategory}
                                          </div>
                                          <div>
                                            <span className="font-semibold text-slate-500">Preço da cor:</span> R$ {colorPrice?.toFixed(2).replace('.', ',')}/m²
                                          </div>
                                        </div>
                                      </div>
                                    )}

                                    {item.notes && (
                                      <div className="bg-amber-50/50 border border-amber-100 p-2 rounded text-xs text-amber-800">
                                        <span className="font-bold">Observações:</span> {item.notes}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                              {order.items.length === 0 && (
                                <p className="text-xs text-slate-400 italic">Sem itens detalhados.</p>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {/* Paginação */}
        {filteredOrders.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-slate-500">
              Mostrando <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> a <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)}</span> de <span className="font-medium">{filteredOrders.length}</span> pedidos
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Anterior
              </button>
              <div className="text-sm font-medium text-slate-700 px-2">
                Página {currentPage} de {totalPages}
              </div>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
