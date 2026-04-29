'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSchedule, completeScheduleAndOrder } from '@/actions/schedule';
import { Calendar, User, Clock, CheckCircle } from 'lucide-react';
import { Modal } from '@/components/Modal';

export function ScheduleForm({ orderId }: { orderId: string }) {
  const [isPending, setIsPending] = useState(false);
  const [technician, setTechnician] = useState('');
  const [notes, setNotes] = useState('');
  const [modalInfo, setModalInfo] = useState<{isOpen: boolean, title: string, message: string}>({ isOpen: false, title: '', message: '' });
  const router = useRouter();

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsPending(true);
    try {
      const now = new Date();

      await createSchedule({
        orderId,
        scheduledAt: now,
        technician,
        notes
      });
      setModalInfo({ isOpen: true, title: 'Sucesso', message: 'Serviço agendado com sucesso!' });
      router.refresh();
    } catch (error) {
      console.error(error);
      setModalInfo({ isOpen: true, title: 'Erro', message: 'Erro ao agendar serviço.' });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSchedule} className="mt-3 space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
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

      <Modal 
        isOpen={modalInfo.isOpen} 
        onClose={() => setModalInfo(s => ({ ...s, isOpen: false }))} 
        title={modalInfo.title}
        actions={
          <button 
            onClick={() => setModalInfo(s => ({ ...s, isOpen: false }))}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold"
          >
            OK
          </button>
        }
      >
        {modalInfo.message}
      </Modal>
    </form>
  );
}

export function CompleteServiceButton({ scheduleId, orderId, orderStatus }: { scheduleId: string, orderId: string, orderStatus: string }) {
  const [isPending, setIsPending] = useState(false);
  const [modalState, setModalState] = useState<{isOpen: boolean, title: string, message: string, type: 'confirm'|'alert', onConfirm?: () => void}>({isOpen: false, title: '', message: '', type: 'alert'});
  const router = useRouter();

  const handleCompleteClick = () => {
    if (orderStatus !== 'COMPLETED' && orderStatus !== 'DELIVERED' && orderStatus !== 'CANCELLED') {
      setModalState({
        isOpen: true,
        title: 'Confirmar Serviço',
        message: 'Serviço Concluído!\n\nDeseja também marcar o Pedido correspondente como "FINALIZADO" no sistema para o parceiro?',
        type: 'confirm',
        onConfirm: () => executeCompletion(true)
      });
    } else {
      setModalState({
        isOpen: true,
        title: 'Confirmar Serviço',
        message: 'Confirmar conclusão deste serviço?',
        type: 'confirm',
        onConfirm: () => executeCompletion(false)
      });
    }
  };

  const executeCompletion = async (markOrderDelivered: boolean) => {
    setModalState(s => ({ ...s, isOpen: false }));
    setIsPending(true);
    try {
      await completeScheduleAndOrder(scheduleId, orderId, markOrderDelivered);
      router.refresh();
    } catch (error) {
      console.error(error);
      setModalState({ isOpen: true, title: 'Erro', message: 'Erro ao concluir serviço.', type: 'alert' });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <>
      <button 
        onClick={handleCompleteClick}
        disabled={isPending}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
      >
        <CheckCircle size={14} />
        {isPending ? 'Salvando...' : 'Concluir Serviço'}
      </button>

      <Modal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState(s => ({ ...s, isOpen: false }))} 
        title={modalState.title}
        actions={
          modalState.type === 'confirm' ? (
            <>
              <button onClick={() => setModalState(s => ({ ...s, isOpen: false }))} className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50">
                Não / Cancelar
              </button>
              <button onClick={modalState.onConfirm} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">
                Sim, Confirmar
              </button>
            </>
          ) : (
            <button onClick={() => setModalState(s => ({ ...s, isOpen: false }))} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">
              OK
            </button>
          )
        }
      >
        {modalState.message}
      </Modal>
    </>
  );
}
