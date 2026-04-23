import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, ShoppingCart, Calendar, MessageSquare } from 'lucide-react';
import { auth } from '@/auth';
import LogoutButton from '@/components/LogoutButton';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Se não estiver logado ou não for admin, renderiza apenas a tela de login em tela cheia
  if (!session || session?.user?.role !== 'ADMIN') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-slate-800">
          <Link href="/admin" className="text-xl font-bold tracking-tight text-white">
            JATE<span className="text-blue-400">ART</span>
            <span className="text-xs font-normal text-slate-400 ml-2 border-l border-slate-700 pl-2">Admin</span>
          </Link>
        </div>
        
        <div className="p-4 flex-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">Gestão</div>
          <nav className="space-y-1">
            <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600/20 text-blue-400 font-medium border border-blue-600/30">
              <LayoutDashboard size={18} />
              Visão Geral
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <MessageSquare size={18} />
              Leads & Orçamentos
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <ShoppingCart size={18} />
              Todos os Pedidos
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <Users size={18} />
              Parceiros B2B
            </Link>
            <Link href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              <Calendar size={18} />
              Agenda de Serviços
            </Link>
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-sm text-slate-300">
              {session?.user?.email?.charAt(0).toUpperCase() || 'AD'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium truncate" title={session?.user?.email || 'Administrador'}>
                {session?.user?.email || 'Administrador'}
              </p>
              <p className="text-xs text-slate-400 truncate">Comercial</p>
            </div>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shadow-sm">
          <Link href="/admin" className="text-lg font-bold text-slate-900">
            JATE<span className="text-blue-600">ART</span> Admin
          </Link>
          <button className="p-2 text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-slate-50">
          {children}
        </div>
      </main>
    </div>
  );
}
