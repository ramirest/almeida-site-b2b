'use client';

import React, { useState, useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Modal } from '@/components/Modal';
import { getBillableMeasure } from '@/config/pricing';

interface DownloadPdfButtonProps {
  budget: any;
  className?: string;
}

export function DownloadPdfButton({ budget, className }: DownloadPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, title: '', message: '' });
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      
      if (!pdfContainerRef.current) return;

      const element = pdfContainerRef.current;
      const budgetNumber = budget.id.slice(-6).toUpperCase();
      
      // Importações dinâmicas
      const html2canvasModule = await import('html2canvas-pro');
      const html2canvas = html2canvasModule.default;
      
      // Carrega o jsPDF dinamicamente via CDN para evitar o erro do Turbopack no SSR (fflate Node Worker)
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
      pdf.save(`orcamento-${budgetNumber}.pdf`);

      // Restaurar o estilo
      element.style.display = 'none';

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      setModalState({
        isOpen: true,
        title: 'Erro na geração',
        message: 'Houve um erro ao gerar o PDF do orçamento. Verifique sua conexão e tente novamente.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const budgetNumber = budget.id.slice(-6).toUpperCase();
  const statusText = budget.status === 'APPROVED' ? 'Aprovado' : 'Aguardando Aprovação';
  const emitDate = new Date(budget.createdAt).toLocaleDateString('pt-BR');
  const validDate = new Date(budget.validity).toLocaleDateString('pt-BR');
  const clientData = budget.items?.clientData || {};
  const services = budget.items?.services || [];

  return (
    <>
      <button 
        onClick={handleDownload}
        disabled={isGenerating}
        className={className || "flex-1 md:flex-none px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"}
      >
        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
        {isGenerating ? 'Gerando...' : 'Baixar PDF'}
      </button>

      {/* Container Oculto para o PDF. É ativado via JS durante a geração */}
      <div ref={pdfContainerRef} style={{ display: 'none' }}>
        <div className="p-8 max-w-[800px] w-[800px] bg-white text-slate-900 font-sans" style={{ minHeight: '1122px' }}>
          
          {/* Cabeçalho */}
          <div className="flex items-center justify-between border-b-4 border-blue-900 pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-black text-blue-900 tracking-tight">JATEART</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">CNPJ: 00.000.000/0000-00</p>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold text-slate-700">ORÇAMENTO COMERCIAL</h2>
              <p className="text-lg font-bold text-blue-600">#{budgetNumber}</p>
            </div>
          </div>

          {/* Grid de Informações */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Informações do Orçamento</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Status:</span> {statusText}</p>
                <p><span className="font-semibold">Data de Emissão:</span> {emitDate}</p>
                <p><span className="font-semibold">Validade:</span> {validDate}</p>
                {budget.convertedToOrderId && (
                  <p className="text-emerald-600 font-bold mt-2">
                    Pedido Gerado: #{budget.convertedToOrderId.slice(-6).toUpperCase()}
                  </p>
                )}
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dados do Cliente</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Empresa:</span> {budget.lead.name || '-'}</p>
                <p><span className="font-semibold">Contato:</span> {clientData.contato || '-'}</p>
                <p><span className="font-semibold">CNPJ:</span> {clientData.cnpj || '-'}</p>
                <p><span className="font-semibold">E-mail:</span> {budget.lead.email || '-'}</p>
                <p><span className="font-semibold">Telefone:</span> {budget.lead.phone || '-'}</p>
              </div>
            </div>
          </div>

          {/* Tabela de Itens */}
          <div className="mb-8">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Itens do Pedido</h3>
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-blue-900 text-white">
                  <th className="p-3 font-semibold rounded-tl-lg">Item</th>
                  <th className="p-3 font-semibold">Serviço</th>
                  <th className="p-3 font-semibold">Detalhes</th>
                  <th className="p-3 font-semibold text-right">Volume</th>
                  <th className="p-3 font-semibold text-center">Unid.</th>
                  <th className="p-3 font-semibold text-center">Qtd.</th>
                  <th className="p-3 font-semibold rounded-tr-lg">Prazo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {services.map((item: any, index: number) => {
                  let details = [];
                  if (item.reference) details.push(`Ref: ${item.reference}`);
                  
                  let volumeInfo = '';
                  let unitInfo = 'm²'; // default sugerido pelo usuário
                  let qtyInfo = item.quantity || '1'; // default para formulários antigos
                  let billableInfo = '';
                  
                  if (item.width && item.height) {
                    const wRaw = parseFloat(item.width);
                    const hRaw = parseFloat(item.height);
                    // Detecção automática: se > 20, assumimos milímetros
                    const isMm = wRaw > 20 || hRaw > 20;
                    const w = isMm ? wRaw / 1000 : wRaw;
                    const h = isMm ? hRaw / 1000 : hRaw;
                    
                    const m2PerPiece = w * h;
                    const totalM2 = m2PerPiece * (parseInt(item.quantity) || 1);
                    
                    volumeInfo = m2PerPiece.toFixed(2).replace('.', ',');
                    unitInfo = 'm²';
                    qtyInfo = item.quantity;
                    
                    const bW = getBillableMeasure(w);
                    const bH = getBillableMeasure(h);
                    const realDimStr = isMm ? `${wRaw}x${hRaw}mm (${w.toFixed(2)}x${h.toFixed(2)}m)` : `${w.toFixed(2)}x${h.toFixed(2)}m`;
                    billableInfo = `Real: ${realDimStr} | m² Tot: ${totalM2.toFixed(2).replace('.', ',')} | Cob: ${bW.toFixed(2)}x${bH.toFixed(2)}m`;
                  } else if (item.width) {
                    const wRaw = parseFloat(item.width);
                    const isMm = wRaw > 20;
                    const w = isMm ? wRaw / 1000 : wRaw;
                    const totalMl = w * (parseInt(item.quantity) || 1);
                    
                    volumeInfo = w.toFixed(2).replace('.', ',');
                    unitInfo = 'ml';
                    qtyInfo = item.quantity;
                    
                    const bW = getBillableMeasure(w);
                    const realDimStr = isMm ? `${wRaw}mm (${w.toFixed(2)}m)` : `${w.toFixed(2)}m`;
                    billableInfo = `Real: ${realDimStr} | Tot: ${totalMl.toFixed(2).replace('.', ',')}ml | Cob: ${bW.toFixed(2)}m`;
                  } else if (item.quantity) {
                    volumeInfo = '-';
                    unitInfo = 'un';
                    qtyInfo = item.quantity;
                  }

                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="p-3 font-medium">{index + 1}</td>
                      <td className="p-3 font-bold text-slate-800">{item.serviceName || item.serviceId || 'Serviço'}</td>
                      <td className="p-3 text-slate-600">{details.join(' | ') || '-'}</td>
                      <td className="p-3 text-slate-600">
                        <div className="font-medium text-right">{volumeInfo}</div>
                        {billableInfo && <div className="text-[10px] text-blue-600 mt-1 whitespace-nowrap text-right">{billableInfo}</div>}
                      </td>
                      <td className="p-3 font-medium text-slate-700 text-center">{unitInfo}</td>
                      <td className="p-3 font-medium text-slate-700 text-center">{qtyInfo}</td>
                      <td className="p-3 text-slate-600">{item.prazo ? new Date(item.prazo).toLocaleDateString('pt-BR') : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Observações dos Itens */}
          {services.some((s: any) => s.notes) && (
            <div className="mb-8 bg-amber-50 p-4 rounded-lg border border-amber-100">
              <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">Observações Técnicas</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm text-amber-900">
                {services.map((item: any, idx: number) => 
                  item.notes ? (
                    <li key={idx}>
                      <strong>Item {idx + 1}:</strong> {item.notes}
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          )}

          {/* Resumo Financeiro */}
          <div className="flex justify-end mb-12">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 w-72">
              <div className="flex justify-between items-center mb-2 text-slate-500">
                <span>Subtotal</span>
                <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.totalValue)}</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-slate-200 mt-2">
                <span className="font-bold text-slate-700">Total Estimado</span>
                <span className="text-2xl font-black text-blue-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(budget.totalValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-slate-400 mt-auto pt-8 border-t border-slate-100">
            <p>Este documento é uma estimativa de custos. Os valores finais podem sofrer alterações após medição técnica ou análise detalhada.</p>
            <p className="mt-1">Documento gerado automaticamente pelo sistema Jateart.</p>
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
