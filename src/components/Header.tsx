import React from 'react';
import Link from 'next/link';
import { User } from 'lucide-react';

export default function Header() {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link href="/" className="text-2xl font-bold text-primary tracking-tight">
            JATE<span className="text-gray-500">ART</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="#servicos" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Nossos Serviços
          </Link>
          <Link href="#vantagens" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
            Vantagens B2B
          </Link>
        </nav>

        {/* CTA Button */}
        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-md text-sm font-medium transition-colors">
            <User size={16} />
            Área do Parceiro
          </button>
          
          {/* Mobile Menu Toggle (Simplified) */}
          <button className="md:hidden p-2 text-foreground">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
