"use client";

import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(true);
  const [message, setMessage] = useState('');

  const toggleChat = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Expanded Chat View */}
      {isOpen && (
        <div className="bg-white w-[320px] sm:w-[350px] shadow-2xl rounded-2xl overflow-hidden border border-gray-100 mb-4 transition-all duration-300 animate-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-primary text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle size={20} className="text-white" />
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-primary"></div>
              </div>
              <div>
                <h4 className="font-bold text-sm">Atendimento B2B</h4>
                <p className="text-xs text-blue-200">Online agora</p>
              </div>
            </div>
            <button 
              onClick={toggleChat}
              className="text-white/80 hover:text-white transition-colors"
              aria-label="Minimizar Atendimento"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Output Area */}
          <div className="h-[280px] bg-[#f8f9fa] p-4 overflow-y-auto flex flex-col gap-4">
            
            {/* Timestamp */}
            <div className="text-center text-xs text-gray-400 my-2">Hoje, {new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</div>
            
            {/* Attendant Message */}
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center text-white">
                <span className="text-xs font-bold">J</span>
              </div>
              <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-sm shadow-sm max-w-[85%] text-sm text-gray-700 leading-relaxed">
                Olá, parceiro. Sou o assistente virtual da Jateart. Dúvidas sobre o status do seu pedido ou nossos serviços de jateamento?
              </div>
            </div>
          </div>
          
          {/* Input Interface */}
          <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
            <input 
              type="text" 
              placeholder="Digite sua dúvida..." 
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <button 
              className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 hover:bg-primary-hover transition-colors"
              aria-label="Enviar mensagem"
            >
              <Send size={16} className={message ? "ml-1" : ""} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Action Button - When closed */}
      {!isOpen && (
        <button 
          onClick={toggleChat}
          className="w-14 h-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          aria-label="Abrir Atendimento"
        >
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
}
