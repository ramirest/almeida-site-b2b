import colorsData from '@/data/colors.json';

export type ColorItem = {
  codigo: string;
  rgb: string;
  hex: string;
  categoria: string;
  price?: number;
};

// Return grouped by category, keeping original order if possible, or sorted.
export const getColorsByCategory = (): Record<string, ColorItem[]> => {
  const grouped: Record<string, ColorItem[]> = {};

  // 1. Injetar cores especiais da tabela de preços
  const { SPECIAL_COLORS } = require('../colorPricing');
  
  (SPECIAL_COLORS as ColorItem[]).forEach(color => {
    if (!grouped[color.categoria]) {
      grouped[color.categoria] = [];
    }
    grouped[color.categoria].push(color);
  });
  
  // 2. Cores da cartela Sayerlack
  (colorsData as ColorItem[]).forEach(color => {
    const cat = color.categoria || 'Geral';
    if (!grouped[cat]) {
      grouped[cat] = [];
    }
    grouped[cat].push(color);
  });
  
  return grouped;
};

export const getAllColors = (): ColorItem[] => {
  const { SPECIAL_COLORS } = require('../colorPricing');
  return [...(SPECIAL_COLORS as ColorItem[]), ...(colorsData as ColorItem[])];
};
