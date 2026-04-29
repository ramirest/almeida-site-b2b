import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Search, Wrench, CheckCircle2 } from 'lucide-react';
import { getSchedules, getOrdersForScheduling } from '@/actions/schedule';
import { ScheduleForm } from '@/components/ScheduleComponents';
import { SchedulesClientList } from '@/components/SchedulesClientList';

export default async function AgendaPage() {
  const schedules = await getSchedules();
  const pendingOrders = await getOrdersForScheduling();



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
          
          <SchedulesClientList schedules={schedules} />
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
