import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrcamentoForm from '@/components/OrcamentoForm';

export const metadata = {
  title: 'Orçamento Rápido | Jateart B2B',
  description: 'Solicite um orçamento de jateamento de vidros ou fornecimento para sua empresa.',
};

export default function OrcamentoPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-20 bg-gray-50 min-h-screen">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12 pt-8">
            <h1 className="text-4xl font-bold text-primary mb-4">Orçamento Rápido</h1>
            <p className="text-lg text-gray-600">
              Obtenha preços de atacado e condições exclusivas para o seu negócio. Preencha os dados e receba sua proposta.
            </p>
          </div>
          
          <OrcamentoForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
