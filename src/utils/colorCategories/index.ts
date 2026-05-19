import colorsData from '@/data/colors.json';

export type ColorItem = {
  codigo: string;
  rgb: string;
  hex: string;
  categoria: string;
};

// Return grouped by category, keeping original order if possible, or sorted.
export const getColorsByCategory = (): Record<string, ColorItem[]> => {
  const grouped: Record<string, ColorItem[]> = {};
  
  (colorsData as ColorItem[]).forEach(color => {
    const cat = color.categoria || 'Geral';
    if (!grouped[cat]) {
      grouped[cat] = [];
    }
    grouped[cat].push(color);
  });
  
  return grouped;
};

export const getAllColors = (): ColorItem[] => colorsData as ColorItem[];
