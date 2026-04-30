import React from 'react';
export const dynamic = 'force-dynamic';
import { getAllPartners } from '@/actions/partners';
import { PartnersClientList } from '@/components/PartnersClientList';

export default async function ParceirosPage() {
  const partners = await getAllPartners();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Parceiros B2B</h1>
        <p className="text-slate-500">Gerencie contas, acessos e analise o desempenho das revendas.</p>
      </div>

      <PartnersClientList initialPartners={partners} />
    </div>
  );
}
