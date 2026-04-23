'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  const handleLogout = async () => {
    // Redireciona para o login do admin ao sair
    await signOut({ callbackUrl: '/admin/login' });
  };

  return (
    <button 
      onClick={handleLogout}
      className="flex items-center gap-3 px-3 py-2 mt-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors w-full text-left font-medium"
    >
      <LogOut size={18} />
      Sair do Admin
    </button>
  );
}
