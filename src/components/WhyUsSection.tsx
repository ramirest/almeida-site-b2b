import React from 'react';
import { ShieldCheck, Lock, Tag } from 'lucide-react';

const advantages = [
  {
    title: 'Zero Conflito de Canal',
    description: 'Nossa fábrica atende exclusivamente CNPJs do setor logístico e de construção. Jamais atravessamos seu cliente final, garantindo a integridade do seu relacionamento comercial.',
    icon: ShieldCheck,
  },
  {
    title: 'Sigilo de Projeto',
    description: 'Assinamos termo de confidencialidade (NDA). Seu projeto personalizado de jateamento artístico ou logomarca corporativa está seguro e blindado contra cópias.',
    icon: Lock,
  },
  {
    title: 'Preço de Atacado',
    description: 'Tabela de preços desenvolvida para viabilizar sua margem de lucro. Quanto maior o volume mensal de m², mais competitivo se torna o seu custo industrial.',
    icon: Tag,
  },
];

export default function WhyUsSection() {
  return (
    <section id="vantagens" className="py-24 bg-white">
      <div className="container">
        <div className="flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Porque Terceirizar com a <span className="text-blue-600">Jatearte?</span></h2>
            <p className="text-lg text-gray-600 mb-10">
              Somos a extensão fabril da sua vidraçaria. Entendemos as dores do segmento corporativo e estruturamos nossa operação para resolver gargalos de produção e prazo.
            </p>
            
            <div className="space-y-8">
              {advantages.map((adv, idx) => {
                const Icon = adv.icon;
                return (
                  <div key={idx} className="flex gap-5">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                        <Icon size={24} />
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{adv.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{adv.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-100 aspect-[4/3]">
              {/* Placeholder image representation utilizing CSS since we can't load real images yet, 
                  but showing a professional, premium aesthetic. */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/90 to-primary/40 flex flex-col justify-end p-8">
                <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl border border-white/20">
                  <p className="text-white font-medium text-lg italic">
                    "Desde que passamos todo o beneficiamento de jateamento para a Jatearte, nossa capacidade de atendimento em obras corporativas triplicou."
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/30 rounded-full"></div>
                    <div>
                      <p className="text-white font-bold">Diretor de Operações</p>
                      <p className="text-blue-200 text-sm">Vidraçaria Parceira</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
