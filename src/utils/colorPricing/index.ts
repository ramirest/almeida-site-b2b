export const SPECIAL_COLORS = [
  { codigo: 'Branco', hex: '#FFFFFF', categoria: 'Cores básicas', price: 175 },
  { codigo: 'Preto', hex: '#000000', categoria: 'Cores básicas', price: 175 },
  { codigo: 'Branco com blackout', hex: '#F0F0F0', categoria: 'Branco com blackout', price: 198 },
  { codigo: 'Bege', hex: '#F5F5DC', categoria: 'Cores intermediárias — Sayerlack', price: 198 },
  { codigo: 'Palha', hex: '#EEE8AA', categoria: 'Cores intermediárias — Sayerlack', price: 198 },
  { codigo: 'Areia', hex: '#C2B280', categoria: 'Cores intermediárias — Sayerlack', price: 198 },
  { codigo: 'Marrom', hex: '#8B4513', categoria: 'Cores intermediárias — Sayerlack', price: 198 },
  { codigo: 'Cinza', hex: '#808080', categoria: 'Cores intermediárias — Sayerlack', price: 198 },
  { codigo: 'Amarelo', hex: '#FFFF00', categoria: 'Cores fortes', price: 205 },
  { codigo: 'Vermelho', hex: '#FF0000', categoria: 'Cores fortes', price: 205 },
  { codigo: 'Azul Bick / Pantone etc', hex: '#0000FF', categoria: 'Cores fortes', price: 205 },
  { codigo: 'Laranja', hex: '#FFA500', categoria: 'Cores fortes', price: 205 },
  { codigo: 'Rosa', hex: '#FFC0CB', categoria: 'Cores fortes', price: 205 },
  { codigo: 'Pink', hex: '#FF1493', categoria: 'Cores fortes', price: 205 },
  { codigo: 'Lilás', hex: '#C8A2C8', categoria: 'Cores fortes', price: 205 },
  { codigo: 'Alumínio', hex: '#E2E2E2', categoria: 'Metálicas', price: 250 },
  { codigo: 'Dourado', hex: '#FFD700', categoria: 'Metálicas', price: 250 },
  { codigo: 'Cobre', hex: '#B87333', categoria: 'Metálicas', price: 250 },
  { codigo: 'Jateada', hex: '#E0E0E0', categoria: 'Pintura Jateada', price: 198 },
  { codigo: 'Espelho Pintura', hex: '#E5E4E2', categoria: 'Pintura Espelho', price: 330 },
];

export function getColorPricing(colorCode: string, originalCategory: string): { category: string, price: number } {
  // Check if it's one of the special colors
  const special = SPECIAL_COLORS.find(c => c.codigo.toLowerCase() === colorCode.toLowerCase());
  if (special) {
    return { category: special.categoria, price: special.price };
  }

  // Se for uma cor da cartela Sayerlack (códigos como F167), ela cai em Cores intermediárias
  return { category: 'Cores intermediárias — Sayerlack', price: 198 };
}
