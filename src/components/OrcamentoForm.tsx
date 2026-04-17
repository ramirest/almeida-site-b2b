'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export default function OrcamentoForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aqui seria a integração com API
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="bg-white p-12 rounded-xl border border-gray-100 shadow-lg text-center max-w-2xl mx-auto">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-3xl font-bold text-primary mb-4">Solicitação Enviada!</h2>
        <p className="text-lg text-gray-600 mb-8">
          Nossa equipe comercial recebeu sua solicitação e entrará em contato em até 2 horas úteis.
        </p>
        <button 
          onClick={() => setIsSubmitted(false)}
          className="inline-flex items-center justify-center px-8 py-3 bg-gray-100 text-gray-700 rounded-md font-bold hover:bg-gray-200 transition-colors"
        >
          Enviar Nova Solicitação
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-xl overflow-hidden max-w-4xl mx-auto">
      <div className="bg-primary px-8 py-6 border-b border-primary-hover">
        <h2 className="text-2xl font-bold text-white">Formulário de Orçamento Rápido</h2>
        <p className="text-blue-200 mt-2">Preencha os dados abaixo para receber uma proposta comercial.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8">
        
        {/* Seção 1: Seus Dados */}
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
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Ex: Vidraçaria Exemplo Ltda"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">CNPJ *</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nome do Contato *</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">E-mail Corporativo *</label>
              <input 
                type="email" 
                required 
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="contato@empresa.com.br"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Telefone Comercial / WhatsApp *</label>
              <input 
                type="tel" 
                required 
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>
        </div>

        {/* Seção 2: O que você precisa? */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-2 mb-6 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
            O Que Você Precisa?
          </h3>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Serviço / Produto *</label>
              <select 
                required
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
              >
                <option value="">Selecione uma opção</option>
                <option value="jateamento">Jateamento de Vidros</option>
                <option value="pelicula">Aplicação de Película</option>
                <option value="fornecimento">Fornecimento de Vidros (Espelhos, Temperados, etc.)</option>
                <option value="projeto">Projeto Especial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Volume Estimado (m²) ou Quantidade</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Ex: 50m² ou 20 peças"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Prazo Desejado</label>
              <select 
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
              >
                <option value="">Selecione um prazo</option>
                <option value="urgente">Urgente (Menos de 3 dias)</option>
                <option value="normal">Normal (Até 7 dias)</option>
                <option value="planejado">Planejado (Mais de 7 dias)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Observações Adicionais / Detalhes do Projeto</label>
              <textarea 
                rows={4}
                className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="Descreva detalhes como espessura do vidro, acabamentos específicos, local de entrega..."
              ></textarea>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button 
            type="submit" 
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-md font-bold hover:bg-primary-hover transition-colors w-full sm:w-auto shadow-md"
          >
            Solicitar Orçamento
            <Send size={20} />
          </button>
        </div>
        
      </form>
    </div>
  );
}
