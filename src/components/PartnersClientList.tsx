'use client';

import React, { useState } from 'react';
import { Building2, Phone, Mail, Settings2, FileText, LayoutList, CheckCircle2, AlertCircle } from 'lucide-react';
import { PartnerStatusSelect } from '@/components/AdminActionButtons';
import { Modal } from '@/components/Modal';
import { updatePartner } from '@/actions/partners';

type PartnerWithRelations = any;

export function PartnersClientList({ initialPartners }: { initialPartners: PartnerWithRelations[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<PartnerWithRelations | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit' | 'orders' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Estados para edição
  const [editData, setEditData] = useState({
    corporateName: '',
    phone: '',
    address: '',
    creditLimit: 0,
    tier: 'PARTNER'
  });

  const filteredPartners = initialPartners.filter(p => 
    p.corporateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.cnpj.includes(searchTerm)
  );

  const openModal = (partner: PartnerWithRelations, mode: 'view' | 'edit' | 'orders') => {
    setSelectedPartner(partner);
    setModalMode(mode);
    setFeedback(null);
    if (mode === 'edit') {
      setEditData({
        corporateName: partner.corporateName,
        phone: partner.phone,
        address: partner.address || '',
        creditLimit: partner.creditLimit || 0,
        tier: partner.tier || 'PARTNER'
      });
    }
  };

  const handleUpdatePartner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
    
    setIsSubmitting(true);
    try {
      await updatePartner(selectedPartner.id, editData);
      setFeedback({ type: 'success', message: 'Dados do parceiro atualizados com sucesso!' });
      // Mantém o modal aberto por um momento para mostrar o sucesso
      setTimeout(() => setModalMode(null), 1500);
    } catch (error) {
      setFeedback({ type: 'error', message: 'Erro ao atualizar dados.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="space-y-6">
      {/* Barra de Busca */}
      <div className="flex justify-end">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Buscar por CNPJ ou nome..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
          />
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
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
                <th className="px-6 py-4 font-medium text-center">Nível / Crédito</th>
                <th className="px-6 py-4 font-medium">Acesso</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPartners.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Nenhum parceiro encontrado com este termo.
                  </td>
                </tr>
              ) : filteredPartners.map((partner) => {
                const totalPedidos = partner.orders?.length || 0;
                const valorTotal = partner.orders?.reduce((sum: number, order: any) => sum + order.totalValue, 0) || 0;
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
                      <div className="text-xs text-slate-500 mt-0.5">{formatCurrency(valorTotal)}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-1 ${
                        partner.tier === 'GOLD' ? 'bg-amber-100 text-amber-700' : 
                        partner.tier === 'DISTRIBUTOR' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {partner.tier}
                      </span>
                      <div className="text-xs font-bold text-slate-900">{formatCurrency(partner.creditLimit)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <PartnerStatusSelect partnerId={partner.id} currentStatus={partner.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button 
                          onClick={() => openModal(partner, 'view')}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" 
                          title="Detalhes"
                        >
                          <Settings2 size={18} />
                        </button>
                        <button 
                          onClick={() => openModal(partner, 'orders')}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
                          title="Ver Pedidos"
                        >
                          <LayoutList size={18} />
                        </button>
                        <button 
                          onClick={() => openModal(partner, 'edit')}
                          className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" 
                          title="Editar"
                        >
                          <FileText size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Detalhes */}
      <Modal
        isOpen={modalMode === 'view' && !!selectedPartner}
        onClose={() => setModalMode(null)}
        title="Detalhes do Parceiro"
      >
        {selectedPartner && (
          <div className="space-y-6 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Razão Social</p>
                <p className="font-bold text-slate-900">{selectedPartner.corporateName}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">CNPJ</p>
                <p className="font-mono text-slate-900">{selectedPartner.cnpj}</p>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Mail size={16} className="text-blue-500" /> Contatos Cadastrados
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-slate-600">Email: <span className="font-medium text-slate-900">{selectedPartner.users?.[0]?.email || 'N/A'}</span></p>
                <p className="text-sm text-slate-600">Telefone: <span className="font-medium text-slate-900">{selectedPartner.phone}</span></p>
                <p className="text-sm text-slate-600">Endereço: <span className="font-medium text-slate-900">{selectedPartner.address || 'Não informado'}</span></p>
              </div>
            </div>

            <div className="flex gap-4">
               <div className="flex-1 p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-[10px] font-bold text-blue-400 uppercase">Nível</p>
                  <p className="font-bold text-blue-700">{selectedPartner.tier}</p>
               </div>
               <div className="flex-1 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase">Crédito</p>
                  <p className="font-bold text-emerald-700">{formatCurrency(selectedPartner.creditLimit)}</p>
               </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Pedidos */}
      <Modal
        isOpen={modalMode === 'orders' && !!selectedPartner}
        onClose={() => setModalMode(null)}
        title={`Pedidos de ${selectedPartner?.corporateName}`}
      >
        <div className="max-h-[400px] overflow-y-auto pr-2">
          {selectedPartner?.orders?.length === 0 ? (
            <p className="text-center py-8 text-slate-500 italic">Nenhum pedido vinculado a este parceiro.</p>
          ) : (
            <div className="space-y-3">
              {selectedPartner?.orders?.map((order: any) => (
                <div key={order.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Pedido #{order.id.slice(-6).toUpperCase()}</p>
                    <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-blue-600">{formatCurrency(order.totalValue)}</p>
                    <span className="text-[10px] font-bold uppercase text-slate-400">{order.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Edição */}
      <Modal
        isOpen={modalMode === 'edit' && !!selectedPartner}
        onClose={() => !isSubmitting && setModalMode(null)}
        title="Editar Parceiro"
      >
        <form onSubmit={handleUpdatePartner} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Razão Social</label>
            <input 
              type="text" 
              value={editData.corporateName}
              onChange={(e) => setEditData({...editData, corporateName: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telefone</label>
              <input 
                type="text" 
                value={editData.phone}
                onChange={(e) => setEditData({...editData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Limite de Crédito</label>
              <input 
                type="number" 
                value={editData.creditLimit}
                onChange={(e) => setEditData({...editData, creditLimit: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nível do Parceiro</label>
            <select 
              value={editData.tier}
              onChange={(e) => setEditData({...editData, tier: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="PARTNER">Parceiro Padrão</option>
              <option value="GOLD">Parceiro Gold</option>
              <option value="DISTRIBUTOR">Distribuidor</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Endereço</label>
            <textarea 
              value={editData.address}
              onChange={(e) => setEditData({...editData, address: e.target.value})}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-20"
            />
          </div>

          {feedback && (
            <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
              {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {feedback.message}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={() => setModalMode(null)}
              className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-lg transition-all"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
