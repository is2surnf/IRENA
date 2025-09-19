// src/pages/UtensiliosPage.tsx
import React, { useState, useMemo } from 'react';
import { useUtensilios } from '../hooks/useUtensilios';
import { Search, Beaker, Plus, X, AlertCircle } from 'lucide-react';
import { getImageUrl } from '../services/utensiliosService';
import type { Utensilio } from '../services/utensiliosService';

const tiposConst: string[] = ['Vidrieria y plasticos', 'Equipos basicos', 'Otros materiales'];

const UtensiliosPage: React.FC = () => {
  const { utensilios, loading, error, refetch } = useUtensilios();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUtensilio, setSelectedUtensilio] = useState<Utensilio | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const tipos = tiposConst;

  const filteredUtensilios = useMemo(() => {
    let filtered = (utensilios || []).filter((utensilio) => utensilio.tipo === tipos[activeTab]);

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (utensilio) =>
          utensilio.nombre.toLowerCase().includes(q) ||
          (utensilio.descripcion?.toLowerCase().includes(q) ?? false)
      );
    }

    return filtered;
  }, [utensilios, activeTab, searchQuery, tipos]);

  const handleTabChange = (index: number) => {
    setActiveTab(index);
    setSearchQuery('');
    setSelectedUtensilio(null);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const formatCapacidad = (capacidad?: number): string | null => {
    if (!capacidad) return null;
    if (capacidad >= 1000) {
      return `${(capacidad / 1000).toFixed(1)} L`;
    }
    return `${capacidad} ml`;
  };

  const handleAddToSimulation = (utensilio: Utensilio) => {
    alert(`${utensilio.nombre} añadido a la simulación`);
    setSelectedUtensilio(null);
  };

  const handleImageError = (utensilioId: number) => {
    setImageErrors((prev) => {
      const next = new Set(prev);
      next.add(utensilioId);
      return next;
    });
  };

  const handleImageLoad = (utensilioId: number) => {
    setImageErrors((prev) => {
      const newSet = new Set(prev);
      newSet.delete(utensilioId);
      return newSet;
    });
  };

  const renderImage = (utensilio: Utensilio, className: string = 'w-full h-48 object-cover') => {
    const hasError = imageErrors.has(utensilio.id);

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
        src={getImageUrl(utensilio.imagen_url)}
        alt={utensilio.nombre}
        className={className}
        onError={() => handleImageError(utensilio.id)}
        onLoad={() => handleImageLoad(utensilio.id)}
        loading="lazy"
      />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex">
        <div className="flex-1 flex flex-col h-screen">
          {/* Header fijo */}
          <div className="bg-gray-800 border-b border-gray-700 flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 py-6">
              <h1 className="text-2xl font-bold mb-6 text-white">Catálogo de utensilios</h1>
              <div className="flex space-x-8 mb-6">
                {tipos.map((_, index) => (
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
            <h1 className="text-2xl font-bold mb-4 text-white">Catálogo de utensilios</h1>

            {/* Tabs */}
            <div className="flex flex-wrap gap-3 mb-5">
              {tipos.map((tipo, index) => (
                <button
                  key={index}
                  onClick={() => handleTabChange(index)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeTab === index
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
                  }`}
                  type="button"
                >
                  {tipo}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={`Buscar en ${tipos[activeTab]}...`}
                value={searchQuery}
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
                  onClick={refetch}
                  className="px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition-colors text-white font-medium"
                >
                  Reintentar
                </button>
              </div>
            ) : filteredUtensilios.length === 0 ? (
              <div className="text-center py-12">
                <Beaker className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  {searchQuery ? 'No se encontraron utensilios' : 'No hay utensilios disponibles'}
                </h3>
                <p className="text-gray-500">
                  {searchQuery ? 'Intenta con otros términos de búsqueda' : 'Contacta al administrador'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUtensilios.map((utensilio) => (
                  <button
                    key={utensilio.id}
                    type="button"
                    onClick={() => setSelectedUtensilio(utensilio)}
                    className="bg-gray-800 rounded-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-[1.02] hover:bg-gray-750 border border-gray-700 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 text-left"
                    aria-label={`Abrir detalles de ${utensilio.nombre}`}
                  >
                    <div className="relative">
                      {renderImage(utensilio)}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2 text-white line-clamp-1">
                        {utensilio.nombre}
                      </h3>
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {utensilio.descripcion}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="px-2 py-1 bg-cyan-600/20 text-cyan-400 text-xs rounded border border-cyan-600/30">
                          {utensilio.tipo}
                        </span>
                        {formatCapacidad(utensilio.capacidad) && (
                          <span className="text-xs text-gray-400 font-medium">
                            {formatCapacidad(utensilio.capacidad)}
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
      {selectedUtensilio && (
        <aside
          aria-label="Panel de detalles de utensilio"
          className="fixed right-0 top-0 w-96 bg-gray-900 border-l border-gray-700 flex-shrink-0 flex flex-col h-screen z-40 shadow-2xl"
        >
          {/* Panel Header */}
          <div className="p-6 border-b border-gray-700 flex-shrink-0">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-bold text-white pr-4 line-clamp-2">
                {selectedUtensilio.nombre}
              </h2>
              <button
                onClick={() => setSelectedUtensilio(null)}
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
              <div>{renderImage(selectedUtensilio, 'w-full h-52 object-cover rounded-lg')}</div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Descripción</label>
                  <p className="text-gray-200 text-sm leading-relaxed">
                    {selectedUtensilio.descripcion}
                  </p>
                </div>

                {formatCapacidad(selectedUtensilio.capacidad) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Capacidad</label>
                    <p className="text-gray-200 text-sm font-medium">
                      {formatCapacidad(selectedUtensilio.capacidad)}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Tipo</label>
                  <span className="inline-block px-3 py-1 bg-cyan-600/20 text-cyan-400 text-sm rounded border border-cyan-600/30">
                    {selectedUtensilio.tipo}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Material</label>
                  <p className="text-gray-200 text-sm">Vidrio borosilicato</p>
                </div>
              </div>
            </div>
          </div>

          {/* Panel Footer */}
          <div className="p-6 border-t border-gray-700 flex-shrink-0 space-y-3">
            <button
              onClick={() => handleAddToSimulation(selectedUtensilio)}
              className="w-full flex items-center justify-center px-4 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Añadir a simulación
            </button>
            <button
              onClick={() => setSelectedUtensilio(null)}
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

export default UtensiliosPage;
