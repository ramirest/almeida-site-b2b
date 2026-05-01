import React from 'react';
import { Plus } from 'lucide-react';
import { getLeads } from '@/actions/crm';
import { LeadsClientList } from '@/components/LeadsClientList';

export default async function LeadsPage() {
  const leads = await getLeads();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestão de Leads (CRM)</h1>
          <p className="text-slate-500">Gerencie potenciais clientes e orçamentos.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Plus size={18} />
          Novo Lead
        </button>
      </div>

      <LeadsClientList initialLeads={leads} />
    </div>
  );
}
