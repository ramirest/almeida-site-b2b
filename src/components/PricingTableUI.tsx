'use client';

import React from 'react';
import { PRICING_TABLE, getCategories, ServicePrice } from '@/config/pricing';

export function PricingTableUI() {
  const categories = getCategories();

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const getUnitLabel = (unit: string) => {
    if (unit === 'm2') return 'm²';
    if (unit === 'ml') return 'metro linear';
    return 'unidade';
  };

  const renderRefSelect = (item: ServicePrice) => {
    if (item.refSingle) {
      return <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-medium inline-block mt-2">REF: {item.refSingle}</div>;
    }
    if (item.refRange) {
      const options = [];
      for (let i = item.refRange.min; i <= item.refRange.max; i++) {
        options.push(i.toString().padStart(2, '0'));
      }
      return (
        <div className="mt-3 max-w-xs">
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Selecione a Referência</label>
          <select className="w-full text-sm font-medium text-slate-700 border border-slate-200 rounded-lg px-3 py-2 bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer hover:border-blue-300">
            <option value="">{item.refRange.label}...</option>
            {options.map(opt => (
              <option key={opt} value={opt}>Referência {opt}</option>
            ))}
          </select>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {categories.map(category => {
        const items = PRICING_TABLE.filter(p => p.category === category);
        return (
          <div key={category} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
              <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
              <h3 className="font-bold text-slate-800 text-lg uppercase tracking-wide">{category}</h3>
            </div>
            <div className="divide-y divide-slate-100">
              {items.map(item => (
                <div key={item.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-base">{item.name}</h4>
                    {item.description && (
                      <p className="text-sm text-slate-500 mt-1 leading-relaxed">{item.description}</p>
                    )}
                    {renderRefSelect(item)}
                  </div>
                  
                  <div className="md:text-right flex flex-col items-start md:items-end">
                    <div className="flex items-baseline gap-1">
                      {item.isStartingPrice && <span className="text-xs text-slate-400 font-medium">a partir de</span>}
                      <span className="text-2xl font-black text-blue-700">{formatCurrency(item.price)}</span>
                      <span className="text-sm text-slate-500 font-medium">/ {getUnitLabel(item.unit)}</span>
                    </div>
                    
                    {item.additionalCosts && item.additionalCosts.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {item.additionalCosts.map((cost, idx) => (
                          <div key={idx} className="text-xs text-amber-700 bg-amber-50 border border-amber-100 px-2 py-1 rounded font-medium inline-block">
                            + {cost.description}: {formatCurrency(cost.price)}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
