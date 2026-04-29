'use client';

import React, { useState, useMemo } from 'react';
import { MapPin, Wrench, CheckCircle2 } from 'lucide-react';
import { CompleteServiceButton } from '@/components/ScheduleComponents';

type ScheduleWithRelations = any; // Tipagem genérica para simplificar

export function SchedulesClientList({ schedules }: { schedules: ScheduleWithRelations[] }) {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const sortedSchedules = useMemo(() => {
    // Ordena do mais recente para o mais antigo (data/hora de confirmação)
    return [...schedules].sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  }, [schedules]);

  const totalPages = Math.ceil(sortedSchedules.length / ITEMS_PER_PAGE) || 1;
  const currentSchedules = sortedSchedules.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const formatDateTime = (dateString: string | Date) => {
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4 min-h-[400px]">
        {currentSchedules.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
            Nenhum serviço agendado para os próximos dias.
          </div>
        ) : currentSchedules.map((schedule) => (
          <div key={schedule.id} className={`bg-white rounded-xl border p-5 shadow-sm transition-all ${
            schedule.status === 'COMPLETED' ? 'border-emerald-200 bg-emerald-50/30 opacity-70' : 'border-slate-200 hover:border-blue-300'
          }`}>
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                    schedule.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {schedule.status === 'COMPLETED' ? 'Concluído' : 'Agendado'}
                  </span>
                  <span className="text-sm font-bold text-slate-900">
                    {formatDateTime(schedule.scheduledAt)}
                  </span>
                </div>
                
                <div>
                  <h3 className="font-bold text-slate-800">
                    Pedido #{schedule.orderId.slice(-6).toUpperCase()} 
                    <span className="text-slate-400 font-normal ml-2">
                      {schedule.order.partner ? schedule.order.partner.corporateName : 'Venda Direta'}
                    </span>
                  </h3>
                  <div className="text-sm text-slate-600 mt-1 line-clamp-2">
                    {schedule.order.items.map((i: any) => `${i.volume} ${i.serviceType}`).join(', ')}
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Wrench size={14} className="text-slate-400" />
                    Técnico: {schedule.technician || 'Não atribuído'}
                  </div>
                  {schedule.order.partner?.address && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                      <MapPin size={14} className="text-slate-400" />
                      {schedule.order.partner.address}
                    </div>
                  )}
                </div>
                
                {schedule.notes && (
                  <div className="bg-slate-50 p-2 rounded text-xs text-slate-600 border border-slate-100 italic">
                    Obs: {schedule.notes}
                  </div>
                )}
              </div>

              <div className="flex sm:flex-col justify-end items-end gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-4 min-w-[140px]">
                {schedule.status !== 'COMPLETED' && (
                  <CompleteServiceButton 
                    scheduleId={schedule.id} 
                    orderId={schedule.orderId} 
                    orderStatus={schedule.order.status} 
                  />
                )}
                {schedule.status === 'COMPLETED' && (
                  <div className="text-emerald-600 flex items-center gap-1 text-sm font-bold">
                    <CheckCircle2 size={16} />
                    Finalizado
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedSchedules.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="text-sm text-slate-500">
            Página <span className="font-bold text-slate-700">{currentPage}</span> de {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Anterior
            </button>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium border border-slate-200 rounded-md text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
