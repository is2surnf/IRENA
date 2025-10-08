import { useState, useMemo } from 'react';
import { useElementos } from '../hooks/useElementos';
import { getImageUrl } from '../services/elementos.service';
import { Search, Atom, X, AlertCircle } from 'lucide-react';
import type { Elemento } from '../services/elementos.service';

const ElementosPage = () => {
  const { elementos, loading, error, searchElementos } = useElementos();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [selectedElemento, setSelectedElemento] = useState<Elemento | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const categorias = [
    { id: 'todos', label: 'Todos', value: '' },
    { id: 'metales', label: 'Metales', value: 'Metales' },
    { id: 'no-metales', label: 'No metales', value: 'No metales' },
    { id: 'gases', label: 'Gases y Halógenos', value: 'Gases y Halógenos' },
    { id: 'acidos', label: 'Ácidos', value: 'Ácidos' },
    { id: 'bases', label: 'Bases', value: 'Bases' },
    { id: 'sales', label: 'Sales', value: 'Sales' },
  ];

  // Filtrar elementos
  const elementosFiltrados = useMemo(() => {
    return elementos.filter(elemento => {
      const matchesSearch = !searchTerm || 
        elemento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        elemento.simbolo?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategoria = !selectedCategoria || elemento.categoria === selectedCategoria;
      
      return matchesSearch && matchesCategoria;
    });
  }, [elementos, searchTerm, selectedCategoria]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoriaChange = (categoria: string) => {
    setSelectedCategoria(categoria);
    setSearchTerm('');
  };

  const openModal = (elemento: Elemento) => {
    setSelectedElemento(elemento);
  };

  const closeModal = () => {
    setSelectedElemento(null);
  };

  const handleImageError = (elementoId: number) => {
    setImageErrors((prev) => {
      const next = new Set(prev);
      next.add(elementoId);
      return next;
    });
  };

  const handleImageLoad = (elementoId: number) => {
    setImageErrors((prev) => {
      const newSet = new Set(prev);
      newSet.delete(elementoId);
      return newSet;
    });
  };

  const renderImage = (elemento: Elemento, className: string = 'w-full h-48 object-contain') => {
    const hasError = imageErrors.has(elemento.id);

    if (hasError) {
      return (
        <div className={`${className} bg-gray-700 flex items-center justify-center`}>
          <div className="text-center text-gray-400">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs">Imagen no disponible</p>
          </div>
        </div>
      );
    }

    return (
      <img
        src={getImageUrl(elemento.imagen_url)}
        alt={elemento.nombre}
        className={className}
        onError={() => handleImageError(elemento.id)}
        onLoad={() => handleImageLoad(elemento.id)}
        loading="lazy"
      />
    );
  };

  const getCategoriaColor = (categoria?: string) => {
    switch (categoria) {
      case 'Metales': return 'bg-amber-600/20 text-amber-400 border-amber-600/30';
      case 'No metales': return 'bg-blue-600/20 text-blue-400 border-blue-600/30';
      case 'Gases y Halógenos': return 'bg-purple-600/20 text-purple-400 border-purple-600/30';
      case 'Ácidos': return 'bg-red-600/20 text-red-400 border-red-600/30';
      case 'Bases': return 'bg-green-600/20 text-green-400 border-green-600/30';
      case 'Sales': return 'bg-slate-600/20 text-slate-400 border-slate-600/30';
      default: return 'bg-cyan-600/20 text-cyan-400 border-cyan-600/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex">
        <div className="flex-1 flex flex-col h-screen">
          {/* Header fijo */}
          <div className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <h1 className="text-2xl font-bold mb-6 text-white">Catálogo de elementos químicos</h1>
              <div className="flex space-x-8 mb-6">
                {categorias.map((_, index) => (
                  <div key={index} className="h-4 bg-gray-700 rounded w-24 animate-pulse"></div>
                ))}
              </div>
              <div className="h-10 bg-gray-700 rounded-lg w-80 animate-pulse"></div>
            </div>
          </div>

          {/* Contenido con scroll */}
          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-4 py-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className="bg-gray-800 rounded-lg overflow-hidden animate-pulse"
                  >
                    <div className="h-48 bg-gray-700"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header fijo */}
        <div className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 py-5">
            <h1 className="text-2xl font-bold mb-4 text-white">Catálogo de elementos químicos</h1>

            {/* Tabs */}
            <div className="flex flex-wrap gap-3 mb-5">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoriaChange(cat.value)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategoria === cat.value
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                  type="button"
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por nombre o símbolo..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 bg-gray-700/70 border border-gray-600 
                           rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent 
                           text-white placeholder-gray-400 shadow-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* Contenido con scroll */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto px-4 py-8">
            {error ? (
              <div className="text-center py-12">
                <div className="text-red-400 mb-4 text-lg">Error: {error}</div>
                <button
                  onClick={() => searchElementos('', '')}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors text-white font-medium"
                >
                  Reintentar
                </button>
              </div>
            ) : elementosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <Atom className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  {searchTerm ? 'No se encontraron elementos' : 'No hay elementos disponibles'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Intenta con otros términos de búsqueda' : 'Contacta al administrador'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {elementosFiltrados.map((elemento) => (
                  <button
                    key={elemento.id}
                    type="button"
                    onClick={() => openModal(elemento)}
                    className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:bg-gray-750 border border-gray-700 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 text-left"
                    aria-label={`Abrir detalles de ${elemento.nombre}`}
                  >
                    <div className="relative">
                      <div className="p-4">
                        {renderImage(elemento, 'w-full h-48 object-contain')}
                      </div>
                      {elemento.simbolo && (
                        <div className="absolute top-4 right-4 text-2xl font-bold text-gray-500">
                          {elemento.simbolo}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 text-white line-clamp-1">
                        {elemento.nombre}
                      </h3>
                      {elemento.descripcion && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {elemento.descripcion}
                        </p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 text-xs rounded border ${getCategoriaColor(elemento.categoria)}`}>
                          {elemento.categoria}
                        </span>
                        {elemento.numero_atomico && (
                          <span className="text-xs text-gray-400 font-medium">
                            N° {elemento.numero_atomico}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Side Panel */}
      {selectedElemento && (
        <aside
          aria-label="Panel de detalles de elemento"
          className="fixed right-0 top-0 w-96 bg-gray-900 border-l border-gray-700 flex-shrink-0 flex flex-col h-screen z-40 shadow-2xl"
        >
          {/* Panel Header */}
          <div className="p-6 border-b border-gray-700 flex-shrink-0">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-white pr-4 line-clamp-2">
                {selectedElemento.nombre}
                {selectedElemento.simbolo && (
                  <span className="text-cyan-400 ml-2">({selectedElemento.simbolo})</span>
                )}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                aria-label="Cerrar panel"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-6 space-y-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                {renderImage(selectedElemento, 'w-full h-52 object-contain')}
              </div>

              <div className="space-y-4">
                {selectedElemento.descripcion && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
                    <p className="text-gray-200 text-sm leading-relaxed">
                      {selectedElemento.descripcion}
                    </p>
                  </div>
                )}

                {selectedElemento.numero_atomico && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Número atómico</label>
                    <p className="text-gray-200 text-sm font-medium">
                      {selectedElemento.numero_atomico}
                    </p>
                  </div>
                )}

                {selectedElemento.masa_atomica && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Masa atómica</label>
                    <p className="text-gray-200 text-sm font-medium">
                      {selectedElemento.masa_atomica.toFixed(3)} u
                    </p>
                  </div>
                )}

                {selectedElemento.densidad && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Densidad</label>
                    <p className="text-gray-200 text-sm font-medium">
                      {selectedElemento.densidad.toFixed(2)} g/cm³
                    </p>
                  </div>
                )}

                {selectedElemento.estado && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Estado</label>
                    <p className="text-gray-200 text-sm">
                      {selectedElemento.estado}
                    </p>
                  </div>
                )}

                {selectedElemento.categoria && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Categoría</label>
                    <span className={`inline-block px-3 py-1 text-sm rounded border ${getCategoriaColor(selectedElemento.categoria)}`}>
                      {selectedElemento.categoria}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel Footer */}
          <div className="p-6 border-t border-gray-700 flex-shrink-0 space-y-3">
            <button
              onClick={() => {
                alert(`${selectedElemento.nombre} añadido a la simulación`);
                closeModal();
              }}
              className="w-full flex items-center justify-center px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Añadir a simulación
            </button>
            <button
              onClick={closeModal}
              className="w-full px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
            >
              Cerrar detalles
            </button>
          </div>
        </aside>
      )}
    </div>
  );
};

export default ElementosPage;