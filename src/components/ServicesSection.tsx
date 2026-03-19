import React from 'react';
import { Maximize, Paintbrush, Layers, Truck } from 'lucide-react';

const services = [
  {
    title: 'Jateamento Total',
    description: 'Privacidade máxima com acabamento uniforme e controle rigoroso de fosqueamento, ideal para divisórias, portas e vitrines comerciais.',
    icon: Maximize,
  },
  {
    title: 'Jateamento Artístico',
    description: 'Projetos personalizados usando plotagem de alta precisão. Logos corporativas, grafismos geométricos e desenhos exclusivos no vidro.',
    icon: Paintbrush,
  },
  {
    title: 'Películas Técnicas',
    description: 'Aplicação B2B de películas jateadas, de segurança e controle solar para obras de grande escala que inviabilizam o jateamento abrasivo.',
    icon: Layers,
  },
  {
    title: 'Logística Integrada',
    description: 'Operação de coleta e entrega com frota própria e cavaletes adequados. Buscamos o vidro cru na vidraçaria, beneficiamos e devolvemos pronto.',
    icon: Truck,
  },
];

export default function ServicesSection() {
  return (
    <section id="servicos" className="py-24 bg-gray-50">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Serviços Técnicos de Jateamento</h2>
          <p className="text-lg text-gray-600">
            Infraestrutura de ponta para atender as demandas técnicas e estéticas dos seus projetos com precisão milimétrica.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div 
                key={index} 
                className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-colors">
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-primary mb-3">{service.title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
