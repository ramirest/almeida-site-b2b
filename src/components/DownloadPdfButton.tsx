'use client';

import React, { useState, useRef } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface DownloadPdfButtonProps {
  budget: any;
  className?: string;
}

export function DownloadPdfButton({ budget, className }: DownloadPdfButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfContainerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      
      const html2pdfModule = await import('html2pdf.js');
      const html2pdf = html2pdfModule.default;

      if (!pdfContainerRef.current) return;

      const budgetNumber = budget.id.slice(-6).toUpperCase();

      const element = pdfContainerRef.current;
      
      const opt = {
        margin: 10,
        filename: `orcamento-${budgetNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opt as any).from(element).save();

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Houve um erro ao gerar o PDF do orçamento.');
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

      {/* Container Oculto para o PDF */}
      <div style={{ display: 'none' }}>
        <div ref={pdfContainerRef} className="p-8 max-w-[800px] w-[800px] bg-white text-slate-900 font-sans" style={{ minHeight: '1122px' }}>
          
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
                  <th className="p-3 font-semibold">Volume</th>
                  <th className="p-3 font-semibold rounded-tr-lg">Prazo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {services.map((item: any, index: number) => {
                  let details = [];
                  if (item.reference) details.push(`Ref: ${item.reference}`);
                  if (item.colorName && item.colorName !== 'Nenhuma') details.push(`Cor: ${item.colorName}`);
                  
                  let volumeInfo = '';
                  if (item.width && item.height) volumeInfo = `${item.width}m x ${item.height}m`;
                  else if (item.width) volumeInfo = `${item.width}m linear`;
                  else if (item.quantity) volumeInfo = `${item.quantity} un`;

                  return (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                      <td className="p-3 font-medium">{index + 1}</td>
                      <td className="p-3 font-bold text-slate-800">{item.serviceName || item.serviceId || 'Serviço'}</td>
                      <td className="p-3 text-slate-600">{details.join(' | ') || '-'}</td>
                      <td className="p-3 text-slate-600">{volumeInfo || '-'}</td>
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
    </>
  );
}
