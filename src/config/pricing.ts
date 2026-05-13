export type PriceUnit = 'm2' | 'ml' | 'un';

export interface ServicePrice {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: PriceUnit;
  isStartingPrice?: boolean; // Para itens "a partir de"
  additionalCosts?: { description: string; price: number }[]; // Para "arte final", etc
  description?: string; // Descrição simples para a UI
  galleryFolder?: string; // Pasta dentro de /public/catalogo/ para buscar as imagens dinamicamente
  refRange?: { min: number; max: number; label: string }; // Mantido para compatibilidade
  refSingle?: string; // Referência única
}

export const PRICING_TABLE: ServicePrice[] = [
  // --- Jateamento ---
  { id: 'jato-total', name: 'Jato total', category: 'Jateamento Básico', price: 65, unit: 'm2', description: 'Jateamento 100% cobrindo a peça.' },
  { id: 'jato-espelho', name: 'Jato em espelho', category: 'Jateamento Básico', price: 115, unit: 'm2', description: 'Técnica de jateamento aplicada em espelhos.' },
  
  // --- Filetes ---
  { id: 'filete-simples', name: 'Filete simples', category: 'Filetes', price: 96, unit: 'm2', galleryFolder: 'referencias', description: 'Linha jateada simples e reta.' },
  { id: 'filete-grego-1', name: 'Filete Grego simples/duplo', category: 'Filetes', price: 106, unit: 'm2', galleryFolder: 'referencias', description: 'Design clássico estilo grego nas bordas.' },
  { id: 'filete-grego-2', name: 'Filete Grego', category: 'Filetes', price: 116, unit: 'm2', galleryFolder: 'referencias', description: 'Variações complexas do padrão grego.' },
  { id: 'filete-grego-desenho', name: 'Filete Grego com desenho', category: 'Filetes', price: 116, unit: 'm2', galleryFolder: 'referencias', description: 'Padrão grego acompanhado de grafismos ou desenhos.' },
  
  // --- Logotipos ---
  { id: 'logo-textos', name: 'Logotipos ou textos', category: 'Serviços Especiais', price: 175, unit: 'm2', description: 'Gravação da sua logomarca ou tipografia.' },
  
  // --- Artísticos ---
  { id: 'artistico-normal', name: 'Artístico normal', category: 'Artísticos', price: 170, unit: 'm2', galleryFolder: 'artisticos', description: 'Desenhos artísticos e formas livres jateadas.' },
  { id: 'artistico-floral', name: 'Artístico floral', category: 'Artísticos', price: 198, unit: 'm2', galleryFolder: 'floral', description: 'Elementos naturais, flores e folhas.' },
  { id: 'artistico-paisagem', name: 'Artístico paisagem/animais', category: 'Artísticos', price: 250, unit: 'm2', galleryFolder: 'artisticos', description: 'Ilustrações de cenários ou figuras animais.' },
  { id: 'artistico-santa-ceia', name: 'Santa Ceia', category: 'Artísticos', price: 480, unit: 'm2', galleryFolder: 'artisticos', description: 'Gravação detalhada e complexa de cenas clássicas.' },
  
  // --- Outros Serviços ---
  { id: 'bizote', name: 'Bizotê artístico', category: 'Serviços Especiais', price: 25, unit: 'ml', description: 'Acabamento lapidado artístico nas bordas do vidro.' },
  { id: 'baixo-relevo', name: 'Baixo relevo', category: 'Serviços Especiais', price: 780, unit: 'm2', description: 'Jateamento profundo com remoção significativa de material.' },
  { id: 'foto-jateada', name: 'Foto jateada', category: 'Serviços Especiais', price: 480, unit: 'm2', additionalCosts: [{ description: 'Arte final', price: 60 }], description: 'Transferência de foto em alta definição para o vidro.' },
  
  // --- Itens Unitários ---
  { id: 'tacas-copos', name: 'Taças / copos / garrafas', category: 'Itens Unitários', price: 21, unit: 'un', isStartingPrice: true, description: 'Personalização de peças cilíndricas ou curvas.' },
  { id: 'tabuas', name: 'Tábuas personalizadas', category: 'Itens Unitários', price: 75, unit: 'un', isStartingPrice: true, galleryFolder: 'tabuas', description: 'Tábua de corte ou serviço decorada.' },
  { id: 'gravacao-tabua', name: 'Gravação em tábua do cliente', category: 'Itens Unitários', price: 50, unit: 'un', galleryFolder: 'tabuas', description: 'Forneça a tábua e nós aplicamos a arte.' },
];

export const getPriceById = (id: string): ServicePrice | undefined => PRICING_TABLE.find(p => p.id === id);

export const getCategories = (): string[] => Array.from(new Set(PRICING_TABLE.map(p => p.category)));

export const getServicesByCategory = (category: string): ServicePrice[] => PRICING_TABLE.filter(p => p.category === category);

// --- CARTELA DE CORES ---
export interface ColorOption {
  id: string;
  name: string;
  pricePerM2: number;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { id: 'nenhuma', name: 'Nenhuma (Padrão)', pricePerM2: 0 },
  { id: 'branco-preto', name: 'Branco / Preto', pricePerM2: 175 },
  { id: 'intermediarias', name: 'Cores Intermediárias', pricePerM2: 198 },
  { id: 'fortes', name: 'Cores Fortes', pricePerM2: 205 },
  { id: 'metalicas', name: 'Metálicas', pricePerM2: 250 },
];

// --- MOTOR DE CÁLCULO DINÂMICO ---

export interface CalculationParams {
  serviceId: string;
  width?: number; // Largura em metros (m)
  height?: number; // Altura em metros (m)
  quantity?: number; // Quantidade (padrão 1)
  includeAdditionalCosts?: boolean; // Se deve somar a arte final, etc (padrão true)
  colorId?: string; // ID da cor selecionada
}

export const calculateServicePrice = (params: CalculationParams): number => {
  const service = getPriceById(params.serviceId);
  if (!service) return 0; // Serviço não encontrado

  const qty = params.quantity || 1;
  let baseCalc = 0;

  let colorPrice = 0;
  if (params.colorId && params.colorId !== 'nenhuma') {
    const color = COLOR_OPTIONS.find(c => c.id === params.colorId);
    if (color) colorPrice = color.pricePerM2;
  }

  if (service.unit === 'm2') {
    // m²: largura × altura × (preço base + preço cor)
    const w = params.width || 0;
    const h = params.height || 0;
    const area = w * h;
    baseCalc = area * (service.price + colorPrice);
  } else if (service.unit === 'ml') {
    // ml: usa apenas a largura × (preço base + preço cor)
    const w = params.width || 0;
    baseCalc = w * (service.price + colorPrice);
  } else if (service.unit === 'un') {
    // unidade: preço cor é assumido por unidade (simplificado) ou não aplicado dependendo da regra
    baseCalc = (service.price + colorPrice) * qty; 
  }

  // Adicionar custos extras (ex: Arte final R$ 60 na Foto Jateada)
  let extras = 0;
  if (params.includeAdditionalCosts !== false && service.additionalCosts) {
    // Por padrão, consideramos que o custo extra (ex: arte final) se aplica uma vez por pedido do item
    extras = service.additionalCosts.reduce((sum, cost) => sum + cost.price, 0) * qty;
  }

  return baseCalc + extras;
};
