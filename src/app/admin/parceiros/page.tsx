import React from 'react';
import { Search, Building2, Phone, Mail, FileText, Settings2, Ban, CheckCircle } from 'lucide-react';
import { getAllPartners } from '@/actions/partners';
import { PartnerStatusSelect } from '@/components/AdminActionButtons';

export default async function ParceirosPage() {
  const partners = await getAllPartners();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Parceiros B2B</h1>
          <p className="text-slate-500">Gerencie contas, acessos e analise o desempenho das revendas.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por CNPJ ou nome..." 
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Empresa / CNPJ</th>
                <th className="px-6 py-4 font-medium">Contatos de Login</th>
                <th className="px-6 py-4 font-medium">Histórico (Pedidos)</th>
                <th className="px-6 py-4 font-medium">Acesso ao Portal</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {partners.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Nenhum parceiro homologado encontrado.
                  </td>
                </tr>
              ) : partners.map((partner) => {
                const totalPedidos = partner.orders.length;
                const valorTotal = partner.orders.reduce((sum, order) => sum + order.totalValue, 0);
                const hasLogin = partner.users && partner.users.length > 0;

                return (
                  <tr key={partner.id} className={`transition-colors ${partner.status === 'BLOCKED' ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <Building2 size={16} className="text-slate-400" />
                        {partner.corporateName}
                      </div>
                      <div className="text-xs text-slate-500 mt-1 font-mono">
                        {partner.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {hasLogin ? (
                        <>
                          <div className="flex items-center gap-2 text-slate-700">
                            <Mail size={14} className="text-slate-400" />
                            {partner.users[0].email}
                          </div>
                          <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                            <Phone size={14} className="text-slate-400" />
                            {partner.phone}
                          </div>
                        </>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Sem credencial de acesso</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{totalPedidos} pedidos</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valorTotal)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <PartnerStatusSelect partnerId={partner.id} currentStatus={partner.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50 transition-colors" title="Ver Detalhes">
                        <Settings2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
