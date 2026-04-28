'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSchedule, completeScheduleAndOrder } from '@/actions/schedule';
import { Calendar, User, Clock, CheckCircle } from 'lucide-react';

export function ScheduleForm({ orderId }: { orderId: string }) {
  const [isPending, setIsPending] = useState(false);
  const [scheduledAt, setScheduledAt] = useState('');
  const [technician, setTechnician] = useState('');
  const [notes, setNotes] = useState('');
  const router = useRouter();

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledAt) return alert('Selecione uma data e hora.');

    setIsPending(true);
    try {
      const selectedDate = new Date(scheduledAt + 'T00:00:00');
      const now = new Date();
      selectedDate.setHours(now.getHours(), now.getMinutes(), now.getSeconds());

      await createSchedule({
        orderId,
        scheduledAt: selectedDate,
        technician,
        notes
      });
      alert('Serviço agendado com sucesso!');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Erro ao agendar serviço.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSchedule} className="mt-3 space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 block">Data</label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="date" 
              required
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 block">Técnico / Equipe</label>
          <div className="relative">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input 
              type="text" 
              placeholder="Ex: Equipe Alpha"
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1 block">Observações (Opcional)</label>
        <input 
          type="text" 
          placeholder="Ex: Ligar antes de chegar..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <button 
        type="submit" 
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <Clock size={14} />
        {isPending ? 'Agendando...' : 'Confirmar Agendamento'}
      </button>
    </form>
  );
}

export function CompleteServiceButton({ scheduleId, orderId, orderStatus }: { scheduleId: string, orderId: string, orderStatus: string }) {
  const [isPending, setIsPending] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    // Regra de negócio: Perguntar se deseja finalizar o pedido também
    let markOrderDelivered = false;
    
    if (orderStatus !== 'READY_FOR_DELIVERY' && orderStatus !== 'DELIVERED' && orderStatus !== 'CANCELLED') {
      const confirmOrderDelivery = confirm(`Serviço Concluído!\n\nDeseja também marcar o Pedido correspondente como "PRONTO PARA ENTREGA" no sistema para o parceiro?`);
      markOrderDelivered = confirmOrderDelivery;
    } else {
      const confirmService = confirm('Confirmar conclusão deste serviço?');
      if (!confirmService) return;
    }

    setIsPending(true);
    try {
      await completeScheduleAndOrder(scheduleId, orderId, markOrderDelivered);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Erro ao concluir serviço.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button 
      onClick={handleComplete}
      disabled={isPending}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
    >
      <CheckCircle size={14} />
      {isPending ? 'Salvando...' : 'Concluir Serviço'}
    </button>
  );
}
