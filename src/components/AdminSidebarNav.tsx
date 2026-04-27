'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Calendar, MessageSquare, FileText, ShoppingCart } from 'lucide-react';

export default function AdminSidebarNav() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Visão Geral', href: '/admin', icon: LayoutDashboard },
    { name: 'Leads & CRM', href: '/admin/leads', icon: MessageSquare },
    { name: 'Orçamentos', href: '/admin/orcamentos', icon: FileText },
    { name: 'Todos os Pedidos', href: '/admin/pedidos', icon: ShoppingCart },
    { name: 'Parceiros B2B', href: '/admin/parceiros', icon: Users },
    { name: 'Agenda de Serviços', href: '/admin/agenda', icon: Calendar },
  ];

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        // Ativo se a rota atual for exatamente igual (ex: /admin) ou começar com a rota do item (ex: /admin/leads)
        // Para a Visão Geral (/admin), só deve ser ativo se for exatamente /admin
        const isActive = 
          item.href === '/admin' 
            ? pathname === '/admin' 
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href === '/admin/agenda' ? '#' : item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              isActive
                ? 'bg-blue-600/20 text-blue-400 font-medium border border-blue-600/30'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white border border-transparent'
            }`}
          >
            <Icon size={18} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
