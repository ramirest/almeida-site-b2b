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


// --- MOTOR DE CÁLCULO DINÂMICO ---

export interface CalculationParams {
  serviceId: string;
  width?: number; // Largura em metros (m)
  height?: number; // Altura em metros (m)
  quantity?: number; // Quantidade (padrão 1)
  includeAdditionalCosts?: boolean; // Se deve somar a arte final, etc (padrão true)
}

// Função para arredondar sempre para o próximo múltiplo de 5 cm (0.05m)
// Ex: 1.61 -> 1.65 | 1.66 -> 1.70 | 1.71 -> 1.75
export const getBillableMeasure = (measure: number): number => {
  if (!measure || measure <= 0) return 0;
  // Multiplica por 20 (que é 1 / 0.05), arredonda para cima (ceil), e divide por 20
  // Isso força o arredondamento perfeito para a casa de 5 em 5 cm.
  // Exemplo: 1.61 * 20 = 32.2 -> Math.ceil(32.2) = 33 -> 33 / 20 = 1.65
  return Math.ceil(measure * 20) / 20;
};

export const calculateServicePrice = (params: CalculationParams): number => {
  const service = getPriceById(params.serviceId);
  if (!service) return 0; // Serviço não encontrado

  const qty = params.quantity || 1;
  let baseCalc = 0;

  if (service.unit === 'm2') {
    // m²: usa a medida arredondada para cobrança (múltiplo de 5)
    const w = params.width || 0;
    const h = params.height || 0;
    const billableW = getBillableMeasure(w);
    const billableH = getBillableMeasure(h);
    const area = billableW * billableH;
    baseCalc = area * service.price * qty;
  } else if (service.unit === 'ml') {
    // ml: usa a largura arredondada para cobrança (múltiplo de 5)
    const w = params.width || 0;
    const billableW = getBillableMeasure(w);
    baseCalc = billableW * service.price * qty;
  } else if (service.unit === 'un') {
    baseCalc = service.price * qty; 
  }

  // Adicionar custos extras (ex: Arte final R$ 60 na Foto Jateada)
  let extras = 0;
  if (params.includeAdditionalCosts !== false && service.additionalCosts) {
    // Por padrão, consideramos que o custo extra (ex: arte final) se aplica uma vez por pedido do item
    extras = service.additionalCosts.reduce((sum, cost) => sum + cost.price, 0) * qty;
  }

  return baseCalc + extras;
};
