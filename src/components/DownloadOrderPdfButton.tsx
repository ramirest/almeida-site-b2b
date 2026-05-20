'use client';

import React, { useState, useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { getBillableMeasure, calculateServicePrice } from '@/config/pricing';
import { getColorPricing } from '@/utils/colorPricing';

interface DownloadOrderPdfButtonProps {
  order: any;
  className?: string;
  iconOnly?: boolean;
}

export function DownloadOrderPdfButton({ order, className, iconOnly }: DownloadOrderPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '' });
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsGenerating(true);
      
      if (!pdfContainerRef.current) return;

      const element = pdfContainerRef.current;
      const orderNumber = order.id.slice(-6).toUpperCase();
      
      // Importações dinâmicas
      const html2canvasModule = await import('html2canvas-pro');
      const html2canvas = html2canvasModule.default;
      
      if (!(window as any).jspdf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
      const jsPDF = (window as any).jspdf.jsPDF;

      // Tornar o elemento temporariamente visível mas escondido do usuário
      element.style.display = 'block';
      element.style.position = 'fixed';
      element.style.left = '0';
      element.style.top = '0';
      element.style.zIndex = '-9999';
      
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        windowWidth: 1200 
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      
      const pdf = new jsPDF({
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      let fileName = `pedido-${orderNumber}.pdf`;
      if (order.partner && order.partner.corporateName) {
         fileName = `pedido-${order.partner.corporateName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${orderNumber}.pdf`;
      }
      
      pdf.save(fileName);

      // Restaurar o estilo
      element.style.display = 'none';

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setModalState({
        isOpen: true,
        title: 'Erro na geração',
        message: 'Houve um erro ao gerar o PDF do pedido. Verifique sua conexão e tente novamente.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const orderNumber = order.id.slice(-6).toUpperCase();
  
  const statusMap: Record<string, string> = {
    'PENDING': 'Pendente',
    'IN_PRODUCTION': 'Em Produção',
    'COMPLETED': 'Finalizado',
    'READY_FOR_DELIVERY': 'Pronto para Entrega',
    'DELIVERED': 'Entregue',
    'CANCELLED': 'Cancelado'
  };
  
  const statusText = statusMap[order.status] || order.status;
  const emitDate = new Date(order.createdAt).toLocaleDateString('pt-BR');
  const deliveryDate = order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString('pt-BR') : 'A definir';
  
  const partner = order.partner || {};
  const items = order.items || [];
  
  const minDeadline = items.reduce((min: string | null, item: any) => {
    if (!item.deadline) return min;
    return !min ? item.deadline : item.deadline; // Simplificado
  }, null);

  return (
    <>
      <button 
        onClick={handleDownload}
        disabled={isGenerating}
        className={className || "p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"}
        title="Baixar PDF do Pedido"
      >
        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        {!iconOnly && <span className="ml-2">{isGenerating ? 'Gerando...' : 'Baixar PDF'}</span>}
      </button>

      {/* Container Oculto para o PDF */}
      <div ref={pdfContainerRef} style={{ display: 'none' }}>
        <div className="p-8 max-w-[900px] w-[900px] bg-white text-slate-900 font-sans" style={{ minHeight: '1122px' }}>
          
          {/* Cabeçalho */}
          <div className="flex items-center justify-between border-b-4 border-blue-900 pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-black text-blue-900 tracking-tight">JATEART</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">CNPJ: 00.000.000/0000-00</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-700">ORDEM DE SERVIÇO / PEDIDO</h2>
              <p className="text-lg font-bold text-blue-600">#{orderNumber}</p>
            </div>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Informações de Produção</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Status do Pedido:</span> {statusText}</p>
                <p><span className="font-semibold">Data de Criação:</span> {emitDate}</p>
                <p><span className="font-semibold">Prazo Desejado:</span> {minDeadline || 'A combinar'}</p>
                <p><span className="font-semibold">Data Prevista (Entrega):</span> {deliveryDate}</p>
                <p><span className="font-semibold">Origem:</span> Portal B2B Parceiros</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dados do Parceiro / Cliente</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Empresa:</span> {partner.corporateName || 'Venda Direta / Avulso'}</p>
                <p><span className="font-semibold">CNPJ:</span> {partner.cnpj ? partner.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5") : '-'}</p>
                <p><span className="font-semibold">Telefone/WhatsApp:</span> {partner.phone || '-'}</p>
                <p><span className="font-semibold">Endereço:</span> {partner.address || 'Não informado'}</p>
              </div>
            </div>
          </div>

          {/* Tabela de Itens */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Itens Solicitados</h3>
            
            <div className="space-y-4">
              {items.map((item: any, index: number) => {
                const wRaw = parseFloat(item.width) || 0;
                const hRaw = parseFloat(item.height) || 0;
                const isMm = wRaw > 20 || hRaw > 20;
                const w = isMm ? wRaw / 1000 : wRaw;
                const h = isMm ? hRaw / 1000 : hRaw;
                const qty = parseInt(item.quantity) || 1;
                
                let colorPrice: number | undefined = undefined;
                let colorCategory = '';
                if (item.colorCode) {
                  const pricing = getColorPricing(item.colorCode, item.colorName || '');
                  colorPrice = pricing.price;
                  colorCategory = pricing.category;
                }
                
                const itemPrice = item.serviceId ? calculateServicePrice({
                  serviceId: item.serviceId,
                  width: w,
                  height: h,
                  quantity: qty,
                  includeAdditionalCosts: true,
                  colorPrice
                }) : 0;
                
                const m2PerPiece = w * h;
                const bW = getBillableMeasure(w);
                const bH = getBillableMeasure(h);
                const cobradoM2PorPeca = bW * bH;
                const totalM2Cobrado = cobradoM2PorPeca * qty;
                
                return (
                  <div key={index} className="bg-white border-2 border-slate-100 p-4 rounded-xl shadow-sm">
                     <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                           <span className="bg-blue-900 text-white font-bold w-6 h-6 flex items-center justify-center rounded-md text-xs">{index + 1}</span>
                           <h4 className="font-bold text-slate-900 uppercase">{item.serviceType || item.serviceName || 'Serviço'}</h4>
                        </div>
                        <div className="font-black text-blue-900 text-lg">
                           {itemPrice > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(itemPrice) : 'Sob Consulta'}
                        </div>
                     </div>
                     
                     <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                        {wRaw > 0 && (
                          <div className="bg-slate-50 p-2 rounded">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Medida Real</span>
                            <span className="font-medium text-slate-700">{wRaw} x {hRaw} mm</span>
                          </div>
                        )}
                        {wRaw > 0 && (
                          <div className="bg-slate-50 p-2 rounded">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Conversão (Cobrança)</span>
                            <span className="font-medium text-slate-700">{bW.toFixed(2)} x {bH.toFixed(2)} m</span>
                          </div>
                        )}
                        <div className="bg-slate-50 p-2 rounded">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Qtd / Unid.</span>
                          <span className="font-medium text-slate-700">{qty} Unid.</span>
                        </div>
                        {wRaw > 0 && (
                          <div className="bg-slate-50 p-2 rounded">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Área Total</span>
                            <span className="font-medium text-slate-700">{totalM2Cobrado.toFixed(2)} m²</span>
                          </div>
                        )}
                     </div>
                     
                     {item.colorCode && (
                       <div className="bg-blue-50/50 border border-blue-100 p-3 rounded-lg mb-3 flex flex-wrap gap-4 text-sm">
                         <div><span className="font-semibold text-slate-600">Cor Escolhida:</span> <span className="font-bold text-slate-900">{item.colorCode} {item.colorName && `(${item.colorName})`}</span></div>
                         <div><span className="font-semibold text-slate-600">Categoria:</span> <span className="font-medium text-slate-800">{colorCategory}</span></div>
                         <div><span className="font-semibold text-slate-600">Valor/m²:</span> <span className="font-medium text-blue-700">R$ {colorPrice?.toFixed(2).replace('.', ',')}</span></div>
                       </div>
                     )}
                     
                     {(item.reference || item.notes) && (
                       <div className="text-sm border-l-4 border-amber-300 bg-amber-50 p-3 rounded-r-lg">
                          {item.reference && <p className="mb-1"><span className="font-bold text-amber-900">Referência:</span> <span className="text-amber-800">{item.reference}</span></p>}
                          {item.notes && <p><span className="font-bold text-amber-900">Observações:</span> <span className="text-amber-800">{item.notes}</span></p>}
                       </div>
                     )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="flex justify-end mb-12">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 w-80">
              <div className="flex justify-between items-center mb-2 text-slate-500">
                <span>Total de Itens</span>
                <span>{items.reduce((sum: number, item: any) => sum + (parseInt(item.quantity) || 1), 0)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200 mt-2">
                <span className="font-bold text-slate-700">Valor Total do Pedido</span>
                <span className="text-2xl font-black text-emerald-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.totalValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-400 mt-auto pt-8 border-t border-slate-100">
            <p>Este documento é uma Ordem de Serviço interna gerada pelo sistema Jateart B2B.</p>
            <p className="mt-1">{new Date().toLocaleString('pt-BR')} - Confidencial</p>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={modalState.isOpen} 
        onClose={() => setModalState({ isOpen: false, title: '', message: '' })} 
        title={modalState.title}
        actions={
          <button 
            type="button"
            onClick={() => setModalState({ isOpen: false, title: '', message: '' })}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
          >
            OK
          </button>
        }
      >
        <p className="text-gray-600">{modalState.message}</p>
      </Modal>
    </>
  );
}
