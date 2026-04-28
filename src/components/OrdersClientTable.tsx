'use client';

import React, { useState, useMemo } from 'react';
import { ShoppingCart, Calendar, Search } from 'lucide-react';
import { OrderStatusSelect } from '@/components/AdminActionButtons';

type OrderWithRelations = any; // Simplificado para o exemplo, idealmente importe o tipo correto do Prisma

export function OrdersClientTable({ initialOrders }: { initialOrders: OrderWithRelations[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return initialOrders;
    
    const lowerTerm = searchTerm.toLowerCase();
    
    return initialOrders.filter((order) => {
      const orderIdMatch = order.id.toLowerCase().includes(lowerTerm);
      const partnerMatch = order.partner ? order.partner.corporateName.toLowerCase().includes(lowerTerm) : 'venda direta avulso'.includes(lowerTerm);
      const itemsMatch = order.items.some((item: any) => item.serviceType.toLowerCase().includes(lowerTerm));
      
      // Tradução de status para busca
      const statusMap: Record<string, string> = {
        'PENDING': 'pendente',
        'IN_PRODUCTION': 'em andamento',
        'COMPLETED': 'finalizado',
        'READY_FOR_DELIVERY': 'pronto para entrega',
        'DELIVERED': 'concluído',
        'CANCELLED': 'cancelado'
      };
      const statusText = statusMap[order.status] || order.status.toLowerCase();
      const statusMatch = statusText.includes(lowerTerm);
      
      return orderIdMatch || partnerMatch || itemsMatch || statusMatch;
    });
  }, [initialOrders, searchTerm]);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Todos os Pedidos</h1>
          <p className="text-slate-500">Gerencie a produção e entrega do ecossistema B2B.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
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
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Nenhum pedido encontrado para a busca "{searchTerm}".
                  </td>
                </tr>
              ) : filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <ShoppingCart size={14} className="text-slate-400" />
                      #{order.id.slice(-6).toUpperCase()}
                    </div>
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(order.createdAt))}
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
                  <td className="px-6 py-4">
                    <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
