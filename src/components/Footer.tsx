import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#111111] text-gray-400 pt-16 pb-8">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 border-b border-gray-800 pb-12">
          
          <div className="md:col-span-2">
            <Link href="/" className="text-3xl font-bold text-white tracking-tight mb-6 inline-block">
              JATE<span className="text-gray-500">ARTE</span>
            </Link>
            <p className="max-w-md leading-relaxed">
              O parceiro logístico e fabril definitivo em jateamento de vidros para o mercado B2B. Aceleramos a sua capacidade produtiva com sigilo, tecnologia e prazo.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Links Úteis</h4>
            <ul className="space-y-3">
              <li><Link href="#servicos" className="hover:text-white transition-colors">Nossos Serviços</Link></li>
              <li><Link href="#vantagens" className="hover:text-white transition-colors">Vantagens B2B</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Área do Parceiro</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Seja um Fornecedor</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Políticas</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Acordo de Confidencialidade</Link></li>
            </ul>
          </div>
          
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© {currentYear} Jateart Industrial. Todos os direitos reservados.</p>
          
          {/* Local SEO Signature */}
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <p className="font-medium text-gray-300">
              Atendimento industrial para vidraçarias em <span className="text-white font-bold">Ribeirão Preto e Região.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
