import React from 'react';
import { Square, Box, Shield, Building, DoorOpen, Layout, Store, Activity } from 'lucide-react';

const products = [
  {
    title: 'Espelhos',
    description: 'Bisotê, lapidado e sob medida para grandes demandas.',
    icon: Square,
  },
  {
    title: 'Box Banheiro',
    description: 'Blindex, frameless e projetos especiais sob medida.',
    icon: Box,
  },
  {
    title: 'Vidro Temperado',
    description: 'Incolor, fumê e bronze para pronta entrega ou projetos.',
    icon: Shield,
  },
  {
    title: 'Fachadas',
    description: 'Laminado, controle solar e insulado para construtoras.',
    icon: Building,
  },
  {
    title: 'Portas de Vidro',
    description: 'Pivotantes, correr e vaivém para uso comercial.',
    icon: DoorOpen,
  },
  {
    title: 'Janelas',
    description: 'Alumínio com vidro temperado para obras corporativas.',
    icon: Layout,
  },
  {
    title: 'Vitrines',
    description: 'Soluções para lojas, restaurantes e hotéis.',
    icon: Store,
  },
  {
    title: 'Corrimãos',
    description: 'Escadas, varandas e piscinas com foco em segurança.',
    icon: Activity,
  },
];

export default function ProductsSection() {
  return (
    <section id="produtos" className="py-24 bg-white border-b border-gray-100">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-6">
            Catálogo Completo
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Soluções em Vidro</h2>
          <p className="text-lg text-gray-600">
            Fornecimento de vidros e esquadrias de alta qualidade para vidraçarias, construtoras e arquitetos.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => {
            const Icon = product.icon;
            return (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-lg flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{product.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
