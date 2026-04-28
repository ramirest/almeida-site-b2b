import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Search, Wrench, CheckCircle2 } from 'lucide-react';
import { getSchedules, getOrdersForScheduling } from '@/actions/schedule';
import { ScheduleForm, CompleteServiceButton } from '@/components/ScheduleComponents';

export default async function AgendaPage() {
  const schedules = await getSchedules();
  const pendingOrders = await getOrdersForScheduling();

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', { 
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agenda de Serviços</h1>
        <p className="text-slate-500">Coordene as entregas e equipes de instalação.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna 1: Lista de Agendamentos */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <CalendarIcon size={20} className="text-blue-600" />
            Serviços Agendados
          </h2>
          
          <div className="space-y-4">
            {schedules.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
                Nenhum serviço agendado para os próximos dias.
              </div>
            ) : schedules.map((schedule) => (
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
                        {schedule.order.items.map(i => `${i.volume} ${i.serviceType}`).join(', ')}
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
        </div>

        {/* Coluna 2: Aguardando Agendamento */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Clock size={20} className="text-amber-500" />
            Fila de Espera
          </h2>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <p className="text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
              Pedidos em produção ou finalizados que precisam de logística.
            </p>
            
            <div className="space-y-4">
              {pendingOrders.length === 0 ? (
                <div className="text-center text-sm text-slate-400 py-4">
                  Nenhum pedido na fila de espera.
                </div>
              ) : pendingOrders.map((order) => (
                <div key={order.id} className="border border-slate-100 rounded-lg p-3 hover:border-slate-300 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-500">
                        {order.partner ? order.partner.corporateName : 'Avulso'}
                      </span>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {order.status === 'COMPLETED' ? 'Pronto' : 'Na Fábrica'}
                      </span>
                      {order.items[0]?.deadline && (
                        <span className="text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                          Prazo: {order.items[0].deadline}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <ScheduleForm orderId={order.id} />
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
