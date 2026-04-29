'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Plus, Trash2, Calculator, ArrowRight } from 'lucide-react';
import { submitOrcamento } from '@/actions/orcamento';
import { Modal } from '@/components/Modal';

type BudgetItem = {
  id: string;
  type: string;
  volume: string;
  prazo: string;
  notes: string;
};

const PRICES: Record<string, number> = {
  jateamento: 85,
  pelicula: 60,
  fornecimento: 150,
  projeto: 0
};

export default function OrcamentoForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', type: '', volume: '', prazo: '', notes: '' }
  ]);
  const [formData, setFormData] = useState({
    empresa: '',
    cnpj: '',
    nome: '',
    email: '',
    telefone: ''
  });

  const handleAddItem = () => {
    setItems([
      ...items, 
      { id: Math.random().toString(36).substr(2, 9), type: '', volume: '', prazo: '', notes: '' }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof BudgetItem, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateTotal = () => {
    let total = 0;
    items.forEach(item => {
      const volumeNum = parseFloat(item.volume.replace(',', '.'));
      if (!isNaN(volumeNum) && item.type && PRICES[item.type]) {
        total += volumeNum * PRICES[item.type];
      }
    });
    return total;
  };

  const totalEstimate = calculateTotal();
  const [modalInfo, setModalInfo] = useState<{isOpen: boolean, title: string, message: string}>({ isOpen: false, title: '', message: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      setModalInfo({ isOpen: true, title: 'Atenção', message: 'Adicione pelo menos um item ao orçamento.' });
      return;
    }

    setIsSubmitting(true);
    
    const result = await submitOrcamento({
      empresa: formData.empresa,
      cnpj: formData.cnpj,
      nome: formData.nome,
      email: formData.email,
      telefone: formData.telefone,
      items,
      totalEstimate
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
      setFormData({ empresa: '', cnpj: '', nome: '', email: '', telefone: '' });
      setItems([{ id: '1', type: '', volume: '', prazo: '', notes: '' }]);
    } else {
      setModalInfo({ isOpen: true, title: 'Erro', message: result.error || "Erro ao enviar orçamento." });
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-white p-12 rounded-xl border border-gray-100 shadow-lg text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-bold text-primary mb-4">Orçamento Enviado com Sucesso!</h2>
        <p className="text-lg text-gray-600 mb-8">
          Sua solicitação foi registrada no nosso sistema. Nosso comercial entrará em contato em breve.
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="inline-flex items-center justify-center px-8 py-3 bg-gray-100 text-gray-700 rounded-md font-bold hover:bg-gray-200 transition-colors"
        >
          Enviar Nova Solicitação
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden max-w-4xl mx-auto">
      <div className="bg-primary px-8 py-6 border-b border-primary-hover flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Formulário de Orçamento Rápido</h2>
          <p className="text-blue-200 mt-2">Preencha os dados abaixo para receber uma proposta comercial.</p>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8">
        
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
            Seus Dados Corporativos
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Razão Social / Nome da Empresa *</label>
              <input 
                type="text" 
                required 
                value={formData.empresa}
                onChange={(e) => setFormData({...formData, empresa: e.target.value})}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Ex: Vidraçaria Exemplo Ltda"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">CNPJ *</label>
              <input 
                type="text" 
                required 
                value={formData.cnpj}
                onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Contato *</label>
              <input 
                type="text" 
                required 
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail Corporativo *</label>
              <input 
                type="email" 
                required 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="contato@empresa.com.br"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone / WhatsApp *</label>
              <input 
                type="tel" 
                required 
                value={formData.telefone}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </div>

        <div className="mb-10">
          <div className="flex justify-between items-end border-b border-gray-200 pb-2 mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
              O Que Você Precisa?
            </h3>
            <button 
              type="button" 
              onClick={handleAddItem}
              className="text-sm font-bold text-primary flex items-center gap-1 hover:text-primary-hover transition-colors bg-blue-50 px-3 py-1.5 rounded-md"
            >
              <Plus size={16} />
              Adicionar outro item
            </button>
          </div>
          
          <div className="space-y-8">
            {items.map((item, index) => (
              <div key={item.id} className="relative bg-gray-50 p-6 rounded-xl border border-gray-100">
                
                {items.length > 1 && (
                  <button 
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remover item"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                
                <h4 className="font-bold text-gray-700 mb-4">Item {index + 1}</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Serviço / Produto *</label>
                    <select 
                      required
                      value={item.type}
                      onChange={(e) => updateItem(item.id, 'type', e.target.value)}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Selecione uma opção</option>
                      <option value="jateamento">Jateamento de Vidros (R$ 85/m²)</option>
                      <option value="pelicula">Aplicação de Película (R$ 60/m²)</option>
                      <option value="fornecimento">Fornecimento de Vidros (R$ 150/m²)</option>
                      <option value="projeto">Projeto Especial (Sob Consulta)</option>
                    </select>
                  </div>
                  
                  <div className="lg:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Volume (m²) *</label>
                    <input 
                      type="text" 
                      required
                      value={item.volume}
                      onChange={(e) => updateItem(item.id, 'volume', e.target.value)}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                      placeholder="Ex: 50"
                    />
                  </div>

                  <div className="lg:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Prazo Desejado</label>
                    <select 
                      value={item.prazo}
                      onChange={(e) => updateItem(item.id, 'prazo', e.target.value)}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                    >
                      <option value="">Selecione um prazo</option>
                      <option value="urgente">Urgente (Menos de 3 dias)</option>
                      <option value="normal">Normal (Até 7 dias)</option>
                      <option value="planejado">Planejado (Mais de 7 dias)</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Observações Adicionais / Detalhes</label>
                    <textarea 
                      rows={2}
                      value={item.notes}
                      onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                      className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                      placeholder="Espessura do vidro, acabamentos, recortes..."
                    ></textarea>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-10 bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Calculator size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Resumo da Estimativa</h4>
              <p className="text-sm text-gray-600">Baseado no volume e tipo de serviço selecionados.</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-500 mb-1">Valor Estimado (Aproximado)</p>
            <p className="text-3xl font-bold text-primary">
              {totalEstimate > 0 
                ? `R$ ${totalEstimate.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                : 'Sob Consulta'}
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-md font-bold hover:bg-primary-hover transition-colors w-full sm:w-auto shadow-md disabled:opacity-70"
          >
            {isSubmitting ? 'Enviando...' : 'Solicitar Orçamento Oficial'}
            {!isSubmitting && <ArrowRight size={20} />}
          </button>
        </div>
        
      </form>

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
    </div>
  );
}
