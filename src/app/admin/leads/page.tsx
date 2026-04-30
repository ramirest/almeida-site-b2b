import React from 'react';
import { Users, Mail, Phone, ExternalLink, Plus } from 'lucide-react';
import { getLeads } from '@/actions/crm';

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Leads (CRM)</h1>
          <p className="text-slate-500">Gerencie potenciais clientes e oportunidades.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={18} />
          Novo Lead
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-medium">Nome / Empresa</th>
                <th className="px-6 py-4 font-medium">Contato</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Origem</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    Nenhum lead encontrado.
                  </td>
                </tr>
              ) : leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{lead.name}</div>
                    <div className="text-xs text-slate-500">ID: {lead.id.slice(-6).toUpperCase()}</div>
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
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${lead.status === 'NEW' ? 'bg-blue-100 text-blue-700' :
                        lead.status === 'CONVERTED' ? 'bg-emerald-100 text-emerald-700' :
                          'bg-slate-100 text-slate-700'
                      }`}>
                      {lead.status === 'NEW' ? 'Novo' :
                        lead.status === 'CONVERTED' ? 'Convertido' : lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {lead.origin}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 font-bold hover:underline">
                      Gerar Orçamento
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
