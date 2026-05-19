'use client';

import React, { useState, useMemo } from 'react';
import { getColorsByCategory, ColorItem, getAllColors } from '@/utils/colorCategories';
import { Search, Check, ChevronDown, ChevronRight } from 'lucide-react';

interface ColorPickerProps {
  value: string; // O código da cor ou HEX
  onChange: (color: ColorItem) => void;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({ value, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const colorsByCategory = useMemo(() => getColorsByCategory(), []);
  const allColors = useMemo(() => getAllColors(), []);

  // Selected color details
  const selectedColor = useMemo(() => allColors.find(c => c.codigo === value || c.hex === value), [value, allColors]);

  // Filtered logic
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return colorsByCategory;
    
    const term = searchTerm.toLowerCase();
    const filtered: Record<string, ColorItem[]> = {};
    
    Object.entries(colorsByCategory).forEach(([cat, colors]) => {
      const matchedColors = colors.filter(c => 
        c.codigo.toLowerCase().includes(term) || 
        c.hex.toLowerCase().includes(term)
      );
      if (matchedColors.length > 0) {
        filtered[cat] = matchedColors;
      }
    });
    
    return filtered;
  }, [searchTerm, colorsByCategory]);

  const toggleCategory = (cat: string) => {
    setExpandedCategory(prev => prev === cat ? null : cat);
  };

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col shadow-sm mt-4">
      {/* Preview Section */}
      <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between gap-4">
        <div className="flex-1">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Cor Selecionada</label>
          {selectedColor ? (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-gray-800">{selectedColor.codigo}</span>
              <span className="text-sm text-gray-500 capitalize">{selectedColor.categoria.toLowerCase()}</span>
            </div>
          ) : (
            <span className="text-sm text-gray-400 italic">Nenhuma cor selecionada</span>
          )}
        </div>
        
        {/* Color Block Preview */}
        <div className="w-16 h-16 rounded-xl shadow-inner border border-gray-200 flex items-center justify-center shrink-0 transition-colors duration-300" 
             style={{ backgroundColor: selectedColor?.hex || '#f3f4f6' }}>
          {!selectedColor && <span className="text-gray-400 text-xs font-bold">?</span>}
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar cor por código ou hex..." 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (e.target.value) {
                // Expand first matched category
                const firstMatch = Object.keys(filteredCategories)[0];
                if (firstMatch) setExpandedCategory(firstMatch);
              }
            }}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Categories & Grid */}
      <div className="max-h-[300px] overflow-y-auto bg-gray-50/50">
        {Object.keys(filteredCategories).length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">Nenhuma cor encontrada para "{searchTerm}"</div>
        ) : (
          Object.entries(filteredCategories).map(([category, colors]) => {
            const isExpanded = searchTerm ? true : expandedCategory === category;
            
            return (
              <div key={category} className="border-b border-gray-200 last:border-b-0">
                <button 
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="w-full px-4 py-3 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-sm text-gray-700 capitalize">{category.toLowerCase()}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-medium bg-gray-100 px-2 py-0.5 rounded-full">{colors.length}</span>
                    {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="p-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 bg-gray-50/50">
                    {colors.map(color => {
                      const isSelected = selectedColor?.codigo === color.codigo;
                      
                      return (
                        <button
                          key={color.codigo}
                          type="button"
                          onClick={() => onChange(color)}
                          className={`
                            group relative flex flex-col items-center justify-center p-2 rounded-lg 
                            border-2 transition-all duration-200 ease-out hover:shadow-md hover:-translate-y-0.5
                            ${isSelected ? 'border-primary bg-primary/5 shadow-sm' : 'border-transparent bg-white hover:border-gray-300'}
                          `}
                        >
                          <div 
                            className={`w-full aspect-video rounded-md shadow-inner mb-2 border ${isSelected ? 'border-primary/20' : 'border-black/5'} flex items-center justify-center relative overflow-hidden`}
                            style={{ backgroundColor: color.hex }}
                          >
                            {isSelected && (
                              <div className="absolute inset-0 bg-black/10 flex items-center justify-center backdrop-blur-[1px]">
                                <div className="bg-white/90 rounded-full p-1 shadow-sm">
                                  <Check size={16} className="text-primary" />
                                </div>
                              </div>
                            )}
                          </div>
                          <span className={`text-sm font-bold truncate w-full text-center ${isSelected ? 'text-primary' : 'text-gray-800'}`}>
                            {color.codigo}
                          </span>
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                            {color.hex}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
