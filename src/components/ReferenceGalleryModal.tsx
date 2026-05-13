import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { Search, X, CheckCircle2, Loader2 } from 'lucide-react';
import { getCatalogFiles } from '@/actions/catalog';

interface ReferenceGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (ref: string) => void;
  serviceName: string;
  galleryFolder: string;
  currentSelection?: string;
}

export function ReferenceGalleryModal({
  isOpen,
  onClose,
  onSelect,
  serviceName,
  galleryFolder,
  currentSelection
}: ReferenceGalleryModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [references, setReferences] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && galleryFolder) {
      setIsLoading(true);
      getCatalogFiles(galleryFolder)
        .then(files => {
          setReferences(files);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isOpen, galleryFolder]);

  const filteredRefs = references.filter(ref => 
    ref.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Formatar o nome do arquivo para exibição (ex: churrasco-01 -> Churrasco 01)
  const formatDisplayName = (filename: string) => {
    // Se for formato de referência padrão (ex: ref-24-a ou 24A), simplifica
    const refMatch = filename.match(/^ref-(\d+)-?([a-z])?$/i);
    if (refMatch) {
      return `REF ${refMatch[1]}${refMatch[2] ? refMatch[2].toUpperCase() : ''}`;
    }
    
    // Para outros arquivos, remove hífens e capitaliza
    return filename
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={`Catálogo: ${serviceName}`}
    >
      <div className="flex flex-col h-[70vh] max-h-[600px]">
        {/* Header de Busca */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Buscar item pelo nome ou número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Mostrando {filteredRefs.length} itens da categoria
          </p>
        </div>

        {/* Grid de Imagens */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Loader2 className="animate-spin mb-2 text-primary" size={32} />
              <p>Carregando galeria...</p>
            </div>
          ) : filteredRefs.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              Nenhuma imagem encontrada para "{searchTerm}"
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredRefs.map(ref => {
                const displayName = formatDisplayName(ref);
                const isSelected = currentSelection === displayName || currentSelection === ref;
                return (
                  <button
                    key={ref}
                    onClick={() => {
                      onSelect(displayName);
                      onClose();
                    }}
                    className={`relative flex flex-col items-center bg-white rounded-xl border-2 transition-all overflow-hidden group
                      ${isSelected ? 'border-primary shadow-md ring-2 ring-primary/20' : 'border-transparent shadow-sm hover:border-primary/50 hover:shadow-md'}`}
                  >
                    {/* Imagem (com fallback para placeholder caso não exista a imagem real) */}
                    <div className="w-full aspect-square bg-gray-100 relative flex items-center justify-center overflow-hidden">
                      {/* Tentamos carregar a imagem real, se falhar mostramos um ícone/placeholder */}
                      <img 
                        src={`/catalogo/${galleryFolder}/${ref}.jpg`} 
                        alt={displayName}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.classList.add('bg-slate-200');
                          e.currentTarget.parentElement!.innerHTML = `<div class="text-slate-400 flex flex-col items-center"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg><span class="text-xs mt-2 font-bold uppercase tracking-wider">Sem Imagem</span></div>`;
                        }}
                      />
                      
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-lg">
                          <CheckCircle2 size={16} />
                        </div>
                      )}
                    </div>
                    
                    {/* Legenda */}
                    <div className={`w-full py-3 px-2 text-center border-t transition-colors text-xs
                      ${isSelected ? 'bg-primary/5 border-primary/20' : 'border-gray-100 bg-white group-hover:bg-gray-50'}`}>
                      <span className={`font-bold ${isSelected ? 'text-primary' : 'text-gray-700'}`}>
                        {displayName}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
