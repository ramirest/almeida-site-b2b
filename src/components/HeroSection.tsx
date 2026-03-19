import React from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight } from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-primary overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0 100 L100 0 L100 100 Z" fill="currentColor" className="text-white" />
        </svg>
      </div>

      <div className="container relative z-10">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium mb-6">
            <span className="flex h-2 w-2 rounded-full bg-blue-400"></span>
            Exclusivo para Vidraçarias e Construtoras
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Seu Parceiro Industrial em <span className="text-blue-400">Jateamento de Vidros</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl leading-relaxed">
            Terceirize seu jateamento com tecnologia e prazo garantido. Escale sua vidraçaria sem aumentar sua equipe ou investir em maquinário.
          </p>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link 
              href="#vantagens" 
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-white text-primary rounded-md font-bold hover:bg-gray-100 transition-colors"
            >
              Seja um Parceiro
              <ArrowRight size={20} />
            </Link>
            
            <Link 
              href="#servicos" 
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-transparent border border-gray-400 text-white rounded-md font-semibold hover:bg-white/5 hover:border-white transition-colors"
            >
              Nossos Serviços
              <ChevronRight size={20} />
            </Link>
          </div>
          
          {/* Trust indicators */}
          <div className="mt-12 pt-8 border-t border-white/10 flex flex-wrap gap-8">
            <div>
              <p className="text-3xl font-bold text-white">+15k</p>
              <p className="text-sm text-gray-400 mt-1">m² Jateados/mês</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">48h</p>
              <p className="text-sm text-gray-400 mt-1">Prazo Médio</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">Zero</p>
              <p className="text-sm text-gray-400 mt-1">Conflito de Canal</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
