import React from 'react';
import { FileText, RefreshCw, CreditCard, Clock, FileCheck } from 'lucide-react';
import Link from 'next/link';

const benefits = [
  {
    title: 'Tabela de preços exclusiva',
    description: 'Acesso a preços de atacado desenvolvidos para proteger sua margem de lucro.',
    icon: FileText,
  },
  {
    title: 'Pedidos recorrentes',
    description: 'Plataforma simplificada para facilitar a reposição do seu estoque.',
    icon: RefreshCw,
  },
  {
    title: 'Linha de crédito',
    description: 'Análise de crédito rápida e limite pré-aprovado para sua empresa.',
    icon: CreditCard,
  },
  {
    title: 'Acompanhamento',
    description: 'Status de produção e entrega dos seus pedidos em tempo real.',
    icon: Clock,
  },
  {
    title: 'NF-e e Boletos',
    description: 'Faturamento facilitado para compras faturadas no CNPJ.',
    icon: FileCheck,
  },
];

export default function B2BPortalInfoSection() {
  return (
    <section id="portal-b2b" className="py-24 bg-gray-50">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/2 order-2 lg:order-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
                      <Icon size={20} />
                    </div>
                    <h4 className="text-md font-bold text-gray-900 mb-2">{benefit.title}</h4>
                    <p className="text-gray-500 text-sm">{benefit.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:w-1/2 order-1 lg:order-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-xs font-bold mb-6">
              Ecossistema Jateart
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">
              Portal <span className="text-blue-600">B2B Exclusivo</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Seja você uma vidraçaria, construtora ou distribuidor — temos condições especiais para parceiros. Acesse nosso portal para ter autonomia total na gestão de seus projetos e fornecimentos.
            </p>
            
            <Link 
              href="/parceiros" 
              className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white rounded-md font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
            >
              Acessar Portal de Parceiros
            </Link>
          </div>
          
        </div>
      </div>
    </section>
  );
}
