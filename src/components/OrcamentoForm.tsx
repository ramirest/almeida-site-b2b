'use client';

import React, { useState } from 'react';
import { Send, CheckCircle2, Plus, Trash2, Calculator, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { submitOrcamento } from '@/actions/orcamento';
import { Modal } from '@/components/Modal';
import { ReferenceGalleryModal } from '@/components/ReferenceGalleryModal';
import { PRICING_TABLE, calculateServicePrice } from '@/config/pricing';
import { ColorPicker } from '@/components/color-picker/ColorPicker';
import { getColorPricing } from '@/utils/colorPricing';

type BudgetItem = {
  id: string;
  mainCategory: string; // 'jateamento' | 'pinturas' | ''
  serviceId: string;
  width: string;
  height: string;
  quantity: string;
  reference: string;
  colorCode?: string;
  colorName?: string;
  prazo: string;
  notes: string;
};

export default function OrcamentoForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [items, setItems] = useState<BudgetItem[]>([
    { id: '1', mainCategory: '', serviceId: '', width: '', height: '', quantity: '1', reference: '', colorCode: '', colorName: '', prazo: '', notes: '' }
  ]);
  const [activeGalleryItem, setActiveGalleryItem] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    empresa: '',
    cnpj: '',
    nome: '',
    email: '',
    telefone: ''
  });

  const handleAddItem = () => {
    setItems(prev => [
      ...prev,
      { id: Math.random().toString(36).substr(2, 9), mainCategory: '', serviceId: '', width: '', height: '', quantity: '1', reference: '', colorCode: '', colorName: '', prazo: '', notes: '' }
    ]);
  };

  const handleRemoveItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof BudgetItem, value: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Resetar campos dependentes
        if (field === 'mainCategory') {
          updated.serviceId = '';
          updated.reference = '';
          updated.colorCode = '';
          updated.colorName = '';
          updated.width = '';
          updated.height = '';
          updated.quantity = '1';
        }
        if (field === 'serviceId') {
          updated.reference = '';
          updated.colorCode = '';
          updated.colorName = '';
          updated.width = '';
          updated.height = '';
          updated.quantity = '1';
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    let total = 0;
    items.forEach(item => {
      if (item.serviceId) {
        let colorPrice: number | undefined = undefined;
        if (item.mainCategory === 'pinturas' && item.colorCode) {
          colorPrice = getColorPricing(item.colorCode, item.colorName || '').price;
        }

        total += calculateServicePrice({
          serviceId: item.serviceId,
          width: (parseFloat(item.width.replace(',', '.')) || 0) / 1000,
          height: (parseFloat(item.height.replace(',', '.')) || 0) / 1000,
          quantity: parseInt(item.quantity) || 1,
          includeAdditionalCosts: true,
          colorPrice
        });
      }
    });
    return total;
  };

  const totalEstimate = calculateTotal();
  const [modalInfo, setModalInfo] = useState<{ isOpen: boolean, title: string, message: string }>({ isOpen: false, title: '', message: '' });

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
      items: items.map(i => {
        const service = PRICING_TABLE.find(p => p.id === i.serviceId);
        let volumeStr = '';
        const wRaw = parseFloat(i.width.replace(',', '.')) || 0;
        const hRaw = parseFloat(i.height.replace(',', '.')) || 0;
        const qty = parseInt(i.quantity) || 1;

        if (service?.unit === 'm2' && wRaw > 0 && hRaw > 0) {
          const m2PerPiece = (wRaw * hRaw) / 1000000;
          const totalM2 = m2PerPiece * qty;
          volumeStr = `${m2PerPiece.toFixed(2).replace('.', ',')} m²/pc | Total: ${totalM2.toFixed(2).replace('.', ',')} m² (${wRaw}x${hRaw}mm, Qtd: ${qty})`;
        } else if (service?.unit === 'ml' && wRaw > 0) {
          const mlPerPiece = wRaw / 1000;
          const totalMl = mlPerPiece * qty;
          volumeStr = `${mlPerPiece.toFixed(2).replace('.', ',')} m/pc | Total: ${totalMl.toFixed(2).replace('.', ',')} m (${wRaw}mm, Qtd: ${qty})`;
        } else {
          volumeStr = `${qty} un`;
        }

        return {
          serviceId: i.serviceId,
          serviceName: service?.name || i.serviceId,
          width: i.width,
          height: i.height,
          quantity: i.quantity,
          reference: i.reference,
          volume: volumeStr,
          prazo: i.prazo,
          notes: i.notes
        };
      }),
      totalEstimate
    });

    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
      setFormData({ empresa: '', cnpj: '', nome: '', email: '', telefone: '' });
      setItems([{ id: '1', mainCategory: '', serviceId: '', width: '', height: '', quantity: '1', reference: '', prazo: '', notes: '' }]);
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
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
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
            {items.map((item, index) => {
              const selectedService = PRICING_TABLE.find(p => p.id === item.serviceId);

              return (
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
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Serviço *</label>

                      {/* Etapa 1: Seleção da categoria principal */}
                      {!item.mainCategory && (
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => updateItem(item.id, 'mainCategory', 'jateamento')}
                            className="flex flex-col items-center justify-center gap-1.5 px-4 py-4 rounded-xl border-2 border-gray-200 bg-white hover:border-primary hover:bg-primary/5 transition-all group"
                          >
                            <span className="text-2xl">💎</span>
                            <span className="font-bold text-sm text-gray-800 group-hover:text-primary">Jateamento</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => updateItem(item.id, 'mainCategory', 'pinturas')}
                            className="flex flex-col items-center justify-center gap-1.5 px-4 py-4 rounded-xl border-2 border-gray-200 bg-white hover:border-primary hover:bg-primary/5 transition-all group"
                          >
                            <span className="text-2xl">🎨</span>
                            <span className="font-bold text-sm text-gray-800 group-hover:text-primary">Pinturas</span>
                          </button>
                        </div>
                      )}

                      {/* Etapa 2: Dropdown de serviços filtrado pela categoria */}
                      {item.mainCategory && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold bg-primary/10 text-primary px-2.5 py-1 rounded-full capitalize">
                              {item.mainCategory === 'jateamento' ? '💎 Jateamento' : '🎨 Pinturas'}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateItem(item.id, 'mainCategory', '')}
                              className="text-xs text-gray-400 hover:text-gray-600 underline"
                            >
                              Alterar
                            </button>
                          </div>
                          <select
                            required
                            value={item.serviceId}
                            onChange={(e) => updateItem(item.id, 'serviceId', e.target.value)}
                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                          >
                            <option value="">Selecione o serviço...</option>
                            {Array.from(new Set(
                              PRICING_TABLE
                                .filter(p => p.mainCategory === item.mainCategory)
                                .map(p => p.category)
                            )).map(cat => (
                              <optgroup key={cat} label={cat}>
                                {PRICING_TABLE
                                  .filter(p => p.category === cat && p.mainCategory === item.mainCategory)
                                  .map(p => (
                                    <option key={p.id} value={p.id}>
                                      {p.name} ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.price)}/{p.unit === 'm2' ? 'm²' : p.unit === 'ml' ? 'ml' : 'un'})
                                    </option>
                                  ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>


                    {selectedService?.galleryFolder && (
                      <div className="lg:col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Referência / Modelo *</label>
                        <button
                          type="button"
                          onClick={() => setActiveGalleryItem(item.id)}
                          className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white flex items-center justify-between text-left group hover:border-primary/50"
                        >
                          <span className={item.reference ? 'font-bold text-primary truncate pr-2' : 'text-gray-500'}>
                            {item.reference ? item.reference : 'Escolher Modelo Visual...'}
                          </span>
                          <ImageIcon size={18} className="text-gray-400 shrink-0 group-hover:text-primary transition-colors" />
                        </button>
                      </div>
                    )}

                    {selectedService?.unit === 'm2' && (
                      <>
                        <div className="lg:col-span-1">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Largura Real (mm) *</label>
                          <input
                            type="number" step="1" min="0" required
                            value={item.width}
                            onChange={(e) => updateItem(item.id, 'width', e.target.value)}
                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                          />
                        </div>
                        <div className="lg:col-span-1">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Altura Real (mm) *</label>
                          <input
                            type="number" step="1" min="0" required
                            value={item.height}
                            onChange={(e) => updateItem(item.id, 'height', e.target.value)}
                            className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                            placeholder="Ex: 2100"
                          />
                        </div>
                      </>
                    )}

                    {selectedService?.unit === 'ml' && (
                      <div className="lg:col-span-1">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Comprimento Linear Real (mm) *</label>
                        <input
                          type="number" step="1" min="0" required
                          value={item.width}
                          onChange={(e) => updateItem(item.id, 'width', e.target.value)}
                          className="w-full px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
                          placeholder="Ex: 3000"
                        />
                      </div>
                    )}

                    <div className="lg:col-span-1">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Quantidade de Peças *</label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => {
                            const currentQty = parseInt(item.quantity) || 1;
                            if (currentQty > 1) updateItem(item.id, 'quantity', (currentQty - 1).toString());
                          }}
                          className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-l-md bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="number" min="1" required
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                          className="w-full h-12 text-center border-t border-b border-gray-300 focus:outline-none focus:ring-0 transition-all bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const currentQty = parseInt(item.quantity) || 1;
                            updateItem(item.id, 'quantity', (currentQty + 1).toString());
                          }}
                          className="w-12 h-12 flex items-center justify-center border border-gray-300 rounded-r-md bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
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

                    {/* Seletor de Cores - Apenas para Pinturas */}
                    {(item.mainCategory === 'pinturas' && item.serviceId) && (
                      <div className="lg:col-span-3">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Seleção de Cor SayerSystem *</label>
                        <ColorPicker
                          value={item.colorCode || ''}
                          onChange={(color) => {
                            updateItem(item.id, 'colorCode', color.codigo);
                            updateItem(item.id, 'colorName', color.categoria);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-10 bg-blue-50 border border-blue-100 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
              <Calculator size={20} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Resumo da Estimativa</h4>
              <p className="text-xs text-gray-500">Baseado no volume e tipo de serviço selecionados.</p>
            </div>
          </div>

          {/* Detalhamento por item */}
          {items.some(i => i.serviceId && (i.width || i.height || i.quantity)) && (
            <div className="space-y-3 mb-4">
              {items.map((item, index) => {
                const svc = PRICING_TABLE.find(p => p.id === item.serviceId);
                if (!svc) return null;
                const wRaw = parseFloat(item.width.replace(',', '.')) || 0;
                const hRaw = parseFloat(item.height.replace(',', '.')) || 0;
                const qty = parseInt(item.quantity) || 1;
                const hasM2 = svc.unit === 'm2' && wRaw > 0 && hRaw > 0;
                const hasMl = svc.unit === 'ml' && wRaw > 0;
                if (!hasM2 && !hasMl && svc.unit !== 'un') return null;
                const m2Peca = hasM2 ? (wRaw * hRaw) / 1000000 : null;
                const totalM2 = m2Peca !== null ? m2Peca * qty : null;
                const mlPeca = hasMl ? wRaw / 1000 : null;
                const totalMl = mlPeca !== null ? mlPeca * qty : null;
                return (
                  <div key={item.id} className="bg-white rounded-lg border border-blue-100 p-3 text-xs">
                    <p className="font-bold text-gray-800 mb-2 text-sm">
                      Item {index + 1}: {svc.name}
                      {item.reference && <span className="ml-2 font-normal text-blue-600">({item.reference})</span>}
                    </p>
                    {item.colorCode && (
                      <div className="mb-2 text-[11px] border-l-2 border-primary pl-2 py-1 bg-primary/5">
                        {(() => {
                          const cp = getColorPricing(item.colorCode, item.colorName || '');
                          return (
                            <>
                              <div className="flex gap-1.5 items-center">
                                <span className="font-semibold text-gray-700">Cor Selecionada: </span>
                                <span className="text-gray-900">{item.colorCode}</span>
                                <span className="text-gray-500">({item.colorName?.toLowerCase()})</span>
                              </div>
                              <div className="flex gap-1.5 items-center mt-0.5">
                                <span className="font-semibold text-gray-700">Categoria: </span>
                                <span className="text-gray-900">{cp.category}</span>
                              </div>
                              <div className="flex gap-1.5 items-center mt-0.5">
                                <span className="font-semibold text-gray-700">Valor da cor: </span>
                                <span className="text-primary font-bold">R$ {cp.price.toFixed(2).replace('.', ',')}/m²</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-gray-600">
                      {hasM2 && (
                        <>
                          <span>Medida Real:</span>
                          <span className="font-medium text-gray-800">{wRaw} × {hRaw} mm</span>
                          <span>Conversão:</span>
                          <span className="font-medium text-gray-800">{(wRaw / 1000).toFixed(2).replace('.', ',')} × {(hRaw / 1000).toFixed(2).replace('.', ',')} m</span>
                          <span>Quantidade:</span>
                          <span className="font-medium text-gray-800">{qty} peça{qty > 1 ? 's' : ''}</span>
                          <span>m² por peça:</span>
                          <span className="font-medium text-gray-800">{m2Peca!.toFixed(4).replace('.', ',')} m²</span>
                          <span className="font-bold text-gray-700">Área Total:</span>
                          <span className="font-bold text-blue-700">{totalM2!.toFixed(4).replace('.', ',')} m²</span>
                        </>
                      )}
                      {hasMl && (
                        <>
                          <span>Comprimento Real:</span>
                          <span className="font-medium text-gray-800">{wRaw} mm</span>
                          <span>Conversão:</span>
                          <span className="font-medium text-gray-800">{(wRaw / 1000).toFixed(3).replace('.', ',')} m</span>
                          <span>Quantidade:</span>
                          <span className="font-medium text-gray-800">{qty} peça{qty > 1 ? 's' : ''}</span>
                          <span className="font-bold text-gray-700">Total Linear:</span>
                          <span className="font-bold text-blue-700">{totalMl!.toFixed(3).replace('.', ',')} m</span>
                        </>
                      )}
                      {svc.unit === 'un' && (
                        <>
                          <span>Quantidade:</span>
                          <span className="font-medium text-gray-800">{qty} unidade{qty > 1 ? 's' : ''}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-blue-200">
            <p className="text-sm font-medium text-gray-500">Valor Estimado (Aproximado)</p>
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

      {/* Modal de Galeria de Referências */}
      {activeGalleryItem && (
        <ReferenceGalleryModal
          isOpen={!!activeGalleryItem}
          onClose={() => setActiveGalleryItem(null)}
          onSelect={(ref) => updateItem(activeGalleryItem, 'reference', ref)}
          serviceName={PRICING_TABLE.find(p => p.id === items.find(i => i.id === activeGalleryItem)?.serviceId)?.name || ''}
          galleryFolder={PRICING_TABLE.find(p => p.id === items.find(i => i.id === activeGalleryItem)?.serviceId)?.galleryFolder || ''}
          refNumberRange={PRICING_TABLE.find(p => p.id === items.find(i => i.id === activeGalleryItem)?.serviceId)?.refNumberRange}
          currentSelection={items.find(i => i.id === activeGalleryItem)?.reference}
        />
      )}
    </div>
  );
}
