// frontend/src/pages/TeoriaPage.tsx (VERSIÓN COMPLETA CON BOTONES FUNCIONALES)
import React, { useState, useMemo } from 'react';
import { 
  Search, 
  BookOpen, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  Circle,
  Filter,
  Zap,
  Award,
  Play,
  X,
  ExternalLink,
  Users,
  Target,
  Lightbulb,
  Grid3X3,
  List,
  TrendingUp,
  Brain,
  Sparkles,
  Eye,
  Maximize2,
  BookmarkPlus,
  Share2,
  Download,
  Star
} from 'lucide-react';
import { useTeoria } from '../hooks/useTeoria';
import type { Teoria } from '../services/teoria.service';
import { truncarTexto, getDificultadColor } from '../services/teoria.service';

// Constantes para categorías con iconos y colores mejorados
const CATEGORIAS_CONFIG = {
  'Fundamentos': { 
    icon: '⚛️', 
    color: 'from-blue-400 via-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-400/20',
    glow: 'shadow-blue-500/20'
  },
  'Estructura Atómica': { 
    icon: '🔬', 
    color: 'from-purple-400 via-purple-500 to-pink-500',
    bg: 'bg-purple-500/10',
    border: 'border-purple-400/20',
    glow: 'shadow-purple-500/20'
  },
  'Enlace Químico': { 
    icon: '🔗', 
    color: 'from-green-400 via-green-500 to-emerald-500',
    bg: 'bg-green-500/10',
    border: 'border-green-400/20',
    glow: 'shadow-green-500/20'
  },
  'Estequiometría': { 
    icon: '⚖️', 
    color: 'from-yellow-400 via-orange-400 to-orange-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-400/20',
    glow: 'shadow-orange-500/20'
  },
  'Termoquímica': { 
    icon: '🌡️', 
    color: 'from-red-400 via-red-500 to-rose-500',
    bg: 'bg-red-500/10',
    border: 'border-red-400/20',
    glow: 'shadow-red-500/20'
  },
  'Cinética Química': { 
    icon: '⚡', 
    color: 'from-indigo-400 via-indigo-500 to-blue-500',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-400/20',
    glow: 'shadow-indigo-500/20'
  },
  'Equilibrio Químico': { 
    icon: '⚖️', 
    color: 'from-teal-400 via-teal-500 to-cyan-500',
    bg: 'bg-teal-500/10',
    border: 'border-teal-400/20',
    glow: 'shadow-teal-500/20'
  },
  'Ácidos y Bases': { 
    icon: '🧪', 
    color: 'from-lime-400 via-lime-500 to-green-500',
    bg: 'bg-lime-500/10',
    border: 'border-lime-400/20',
    glow: 'shadow-lime-500/20'
  },
  'Redox': { 
    icon: '🔥', 
    color: 'from-orange-400 via-orange-500 to-red-500',
    bg: 'bg-orange-500/10',
    border: 'border-orange-400/20',
    glow: 'shadow-orange-500/20'
  },
  'Química Orgánica': { 
    icon: '🧬', 
    color: 'from-violet-400 via-violet-500 to-purple-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-400/20',
    glow: 'shadow-violet-500/20'
  }
};

const TeoriaPage: React.FC = () => {
  const { 
    teorias, 
    teoriaSeleccionada,
    tareas,
    loading, 
    error, 
    refetch,
    buscarTeorias,
    getTeoriasPorCategoria,
    fetchTeoria,
    marcarComoLeida,
    isTeoriaLeida,
    getEstadisticasProgreso,
    setTeoriaSeleccionada,
    handleSimulacion,
    handleGuardarTeoria,
    handleCompartirTeoria
  } = useTeoria();

  const [activeCategory, setActiveCategory] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFullScreen, setShowFullScreen] = useState<boolean>(false);
  const [savedTeorias, setSavedTeorias] = useState<number[]>([]);

  const stats = getEstadisticasProgreso();

  // Filtrar teorías
  const filteredTeorias = useMemo(() => {
    let filtered = teorias;

    // Filtrar por categoría
    if (activeCategory !== 'Todas') {
      filtered = filtered.filter(teoria => teoria.categoria === activeCategory);
    }

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(teoria =>
        teoria.titulo.toLowerCase().includes(query) ||
        teoria.contenido.toLowerCase().includes(query) ||
        teoria.categoria.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [teorias, activeCategory, searchQuery]);

  const handleCategoryChange = (categoria: string) => {
    setActiveCategory(categoria);
    setSearchQuery('');
    if (categoria === 'Todas') {
      refetch();
    } else {
      getTeoriasPorCategoria(categoria);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.trim()) {
      buscarTeorias(value, activeCategory !== 'Todas' ? activeCategory : undefined);
    } else {
      if (activeCategory === 'Todas') {
        refetch();
      } else {
        getTeoriasPorCategoria(activeCategory);
      }
    }
  };

  const handleSelectTeoria = async (teoria: Teoria) => {
    await fetchTeoria(teoria.id);
  };

  const handleMarkAsRead = async (teoriaId: number) => {
    const success = await marcarComoLeida(teoriaId);
    if (success) {
      console.log(`Teoría ${teoriaId} marcada como leída`);
    }
  };

  const handleStartSimulation = (teoria: Teoria) => {
    handleSimulacion(teoria);
  };

  const handleSaveTeoria = (teoria: Teoria) => {
    handleGuardarTeoria(teoria);
    // Actualizar estado local para feedback visual
    setSavedTeorias(prev => 
      prev.includes(teoria.id) 
        ? prev.filter(id => id !== teoria.id)
        : [...prev, teoria.id]
    );
  };

  const handleShareTeoria = (teoria: Teoria) => {
    handleCompartirTeoria(teoria);
  };

  const handleDownloadTeoria = (teoria: Teoria) => {
    // Crear y descargar archivo PDF simulado
    const content = `
      Título: ${teoria.titulo}
      Categoría: ${teoria.categoria}
      
      ${teoria.contenido}
      
      ---
      Descargado desde IReNaTech - ${new Date().toLocaleDateString()}
    `;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${teoria.titulo.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isTeoriaGuardada = (teoriaId: number) => {
    return savedTeorias.includes(teoriaId);
  };

  const getCategoriaConfig = (categoria: string) => {
    return CATEGORIAS_CONFIG[categoria as keyof typeof CATEGORIAS_CONFIG] || {
      icon: '📚',
      color: 'from-gray-400 to-gray-500',
      bg: 'bg-gray-500/10',
      border: 'border-gray-400/20',
      glow: 'shadow-gray-500/20'
    };
  };

  // Componente de tarjeta de teoría mejorada
  const TeoriaCard: React.FC<{ teoria: Teoria }> = ({ teoria }) => {
    const config = getCategoriaConfig(teoria.categoria);
    const isRead = isTeoriaLeida(teoria.id);
    const isSaved = isTeoriaGuardada(teoria.id);

    return (
      <div
        onClick={() => handleSelectTeoria(teoria)}
        className="group relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm 
                   border border-gray-600/50 rounded-xl overflow-hidden cursor-pointer 
                   transition-all duration-500 hover:border-cyan-400/30 hover:scale-105 hover:-translate-y-2
                   hover:shadow-2xl hover:shadow-cyan-500/10 will-change-transform"
      >
        {/* Efecto de brillo en hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-cyan-400/5 to-transparent 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Barra superior con gradiente de categoría */}
        <div className={`h-1 bg-gradient-to-r ${config.color}`} />
        
        <div className="relative p-6 z-10">
          {/* Badge de categoría e indicador de lectura */}
          <div className="flex items-center justify-between mb-4">
            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold 
                            backdrop-blur-sm border ${config.bg} ${config.border} text-white/90`}>
              <span className="mr-1.5 text-sm">{config.icon}</span>
              {teoria.categoria}
            </span>
            
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSaveTeoria(teoria);
                }}
                className={`p-1.5 rounded-lg transition-all duration-300 ${
                  isSaved 
                    ? 'text-yellow-400 bg-yellow-400/20 hover:bg-yellow-400/30' 
                    : 'text-gray-400 bg-gray-600/20 hover:bg-gray-500/30 hover:text-yellow-400'
                }`}
              >
                <Star className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
              
              {isRead ? (
                <div className="relative">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  <div className="absolute inset-0 bg-green-400/20 rounded-full animate-pulse" />
                </div>
              ) : (
                <Circle className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300" />
              )}
            </div>
          </div>

          {/* Título */}
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 leading-tight
                         group-hover:text-cyan-300 transition-colors duration-300">
            {teoria.titulo}
          </h3>

          {/* Contenido truncado */}
          <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
            {truncarTexto(teoria.contenido, 120)}
          </p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-gray-500 text-xs">
                <Clock className="w-4 h-4 mr-1.5" />
                <span>10-15 min</span>
              </div>
              <div className="flex items-center text-gray-500 text-xs">
                <Eye className="w-4 h-4 mr-1.5" />
                <span>Lectura</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 
                                     group-hover:translate-x-1 transition-all duration-300" />
            </div>
          </div>
        </div>

        {/* Indicador de progreso si está leído */}
        {isRead && (
          <div className="absolute top-0 right-0 bg-gradient-to-br from-green-500 to-green-600 
                          text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
            ✓ Completado
          </div>
        )}
      </div>
    );
  };

  // Vista de lista mejorada
  const TeoriaListItem: React.FC<{ teoria: Teoria }> = ({ teoria }) => {
    const config = getCategoriaConfig(teoria.categoria);
    const isRead = isTeoriaLeida(teoria.id);
    const isSaved = isTeoriaGuardada(teoria.id);

    return (
      <div
        onClick={() => handleSelectTeoria(teoria)}
        className="group bg-gradient-to-r from-slate-800/60 to-slate-800/40 backdrop-blur-sm 
                   rounded-xl p-5 cursor-pointer border border-gray-600/50 
                   transition-all duration-300 hover:border-cyan-400/30 hover:bg-gray-700/50 
                   hover:shadow-lg hover:shadow-cyan-500/5 hover:-translate-y-1"
      >
        <div className="flex items-center gap-4">
          {/* Indicador de lectura */}
          <div className="flex-shrink-0">
            {isRead ? (
              <div className="relative">
                <CheckCircle className="w-7 h-7 text-green-400" />
                <div className="absolute inset-0 bg-green-400/20 rounded-full animate-pulse" />
              </div>
            ) : (
              <Circle className="w-7 h-7 text-gray-400 group-hover:text-cyan-400 transition-colors duration-300" />
            )}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-semibold text-white truncate group-hover:text-cyan-300 
                           transition-colors duration-300">
                {teoria.titulo}
              </h3>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold 
                              backdrop-blur-sm border ${config.bg} ${config.border} text-white/90 flex-shrink-0`}>
                <span className="mr-1">{config.icon}</span>
                {teoria.categoria}
              </span>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed mb-2">
              {truncarTexto(teoria.contenido, 150)}
            </p>
            
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                10-15 min
              </span>
              <span className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                Lectura
              </span>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex-shrink-0 flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSaveTeoria(teoria);
              }}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isSaved 
                  ? 'text-yellow-400 bg-yellow-400/20 hover:bg-yellow-400/30' 
                  : 'text-gray-400 bg-gray-600/20 hover:bg-gray-500/30 hover:text-yellow-400'
              }`}
            >
              <Star className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            
            <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-cyan-400 
                                   group-hover:translate-x-1 transition-all duration-300" />
          </div>
        </div>
      </div>
    );
  };

  if (loading && teorias.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
        <div className="flex-1 flex flex-col">
          {/* Header skeleton */}
          <div className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-xl 
                         border-b border-gray-700/30 shadow-xl">
            <div className="max-w-7xl mx-auto px-8 py-8">
              <div className="h-10 bg-gradient-to-r from-gray-600 to-gray-700 rounded-xl w-80 mb-8 animate-pulse" />
              
              {/* Stats skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>

              {/* Categories skeleton */}
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-10 bg-gradient-to-r from-gray-600 to-gray-700 
                                       rounded-full w-32 flex-shrink-0 animate-pulse" />
                ))}
              </div>

              {/* Search skeleton */}
              <div className="h-14 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl w-96 animate-pulse" />
            </div>
          </div>

          {/* Content skeleton */}
          <div className="flex-1 overflow-y-auto p-10">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden animate-pulse">
                    <div className="h-1 bg-gradient-to-r from-cyan-400 to-blue-500" />
                    <div className="p-6">
                      <div className="h-6 bg-gray-700 rounded-full w-24 mb-4" />
                      <div className="h-7 bg-gray-600 rounded w-full mb-3" />
                      <div className="space-y-2 mb-6">
                        <div className="h-4 bg-gray-700 rounded w-full" />
                        <div className="h-4 bg-gray-700 rounded w-3/4" />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-700 rounded w-28" />
                        <div className="h-5 w-5 bg-gray-700 rounded" />
                      </div>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Layout principal */}
      <div className={`transition-all duration-500 ${teoriaSeleccionada && !showFullScreen ? 'mr-[28rem]' : ''}`}>
        
        {/* Header */}
        <header className="bg-gradient-to-r from-slate-800/95 to-slate-900/95 backdrop-blur-xl 
                         border-b border-gray-700/30 shadow-xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h1 className="flex items-center text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
                <div className="relative mr-3 sm:mr-4">
                  <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-400" />
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  Centro de Teoría Química
                </span>
              </h1>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  className="p-2 sm:p-3 bg-gray-700/70 border border-gray-600/30 rounded-xl text-white 
                           hover:bg-gray-600/70 hover:border-cyan-400/30 transition-all duration-300
                           backdrop-blur-sm hover:-translate-y-1"
                  title={`Cambiar a vista ${viewMode === 'grid' ? 'lista' : 'grilla'}`}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4 sm:w-5 sm:h-5" /> : <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 sm:p-3 bg-gray-700/70 border border-gray-600/30 rounded-xl text-white 
                           hover:bg-gray-600/70 hover:border-cyan-400/30 transition-all duration-300
                           backdrop-blur-sm hover:-translate-y-1"
                  title="Filtros"
                >
                  <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="relative bg-gradient-to-br from-cyan-500/10 to-blue-500/10 
                            border border-cyan-400/20 rounded-xl p-4 sm:p-6 backdrop-blur-sm
                            hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center">
                  <div className="p-2 sm:p-3 bg-cyan-400/20 rounded-xl mr-3 sm:mr-4">
                    <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Total de Temas</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stats.total}</p>
                  </div>
                </div>
              </div>
              
              <div className="relative bg-gradient-to-br from-green-500/10 to-emerald-500/10 
                            border border-green-400/20 rounded-xl p-4 sm:p-6 backdrop-blur-sm
                            hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/5 to-transparent rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <div className="relative flex items-center">
                  <div className="p-2 sm:p-3 bg-green-400/20 rounded-xl mr-3 sm:mr-4">
                    <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Completados</p>
                    <p className="text-2xl sm:text-3xl font-bold text-white">{stats.leidas}</p>
                  </div>
                </div>
              </div>
              
              <div className="relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 
                            border border-purple-400/20 rounded-xl p-4 sm:p-6 backdrop-blur-sm
                            hover:-translate-y-1 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-transparent rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="flex items-center mb-3">
                    <div className="p-2 sm:p-3 bg-purple-400/20 rounded-xl mr-3 sm:mr-4">
                      <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-xs sm:text-sm mb-1">Progreso</p>
                      <p className="text-2xl sm:text-3xl font-bold text-white">{stats.porcentaje}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${stats.porcentaje}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Categorías */}
            <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-cyan-500">
              <button
                onClick={() => handleCategoryChange('Todas')}
                className={`flex items-center px-3 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold 
                          backdrop-blur-sm border flex-shrink-0 transition-all duration-300
                          ${activeCategory === 'Todas' 
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 border-cyan-400/30' 
                            : 'bg-gray-700/70 text-gray-300 border-gray-600/30 hover:bg-gray-600/70 hover:text-white hover:border-gray-500/50 hover:-translate-y-0.5'
                          }`}
              >
                <span className="mr-1 sm:mr-2">🌟</span>
                <span className="whitespace-nowrap">Todas las categorías</span>
              </button>
              
              {Object.entries(CATEGORIAS_CONFIG).map(([categoria]) => (
                <button
                  key={categoria}
                  onClick={() => handleCategoryChange(categoria)}
                  className={`flex items-center px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold 
                            backdrop-blur-sm border flex-shrink-0 transition-all duration-300
                            ${activeCategory === categoria 
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 border-cyan-400/30' 
                              : 'bg-gray-700/70 text-gray-300 border-gray-600/30 hover:bg-gray-600/70 hover:text-white hover:border-gray-500/50 hover:-translate-y-0.5'
                            }`}
                >
                  <span className="mr-1 sm:mr-2">{getCategoriaConfig(categoria).icon}</span>
                  <span className="whitespace-nowrap">{categoria}</span>
                </button>
              ))}
            </div>

            {/* Búsqueda */}
            <div className="relative max-w-3xl group">
              <Search className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5 z-10" />
              <input
                type="text"
                placeholder={`Explora ${activeCategory === 'Todas' ? 'todos los temas' : activeCategory}...`}
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-12 sm:pl-14 pr-4 sm:pr-6 py-3 sm:py-4 bg-gray-700/70 backdrop-blur-sm border border-gray-600/30 
                         rounded-xl text-white placeholder-gray-400 text-sm sm:text-base
                         focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 
                         hover:bg-gray-700/80 transition-all duration-300
                         shadow-lg focus:shadow-xl focus:shadow-cyan-500/10"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/5 to-blue-500/5 rounded-xl 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <main className="min-h-[calc(100vh-400px)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
            {error ? (
              <div className="text-center py-20">
                <div className="bg-red-500/10 border border-red-400/20 rounded-xl p-8 max-w-md mx-auto">
                  <div className="text-red-400 mb-6 text-xl font-semibold">Error: {error}</div>
                  <button
                    onClick={refetch}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white 
                             border-none rounded-xl font-semibold shadow-lg shadow-cyan-500/25 
                             hover:from-cyan-400 hover:to-blue-400 hover:shadow-xl hover:shadow-cyan-500/35
                             transition-all duration-300 cursor-pointer"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            ) : filteredTeorias.length === 0 ? (
              <div className="text-center py-20">
                <div className="mb-8">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <BookOpen className="w-24 h-24 text-gray-500" />
                    <Brain className="w-8 h-8 text-cyan-400 absolute -top-2 -right-2 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-300 mb-3">
                    {searchQuery ? 'No se encontraron temas' : 'No hay temas disponibles'}
                  </h3>
                  <p className="text-gray-500 text-lg">
                    {searchQuery 
                      ? 'Intenta con otros términos de búsqueda'
                      : `No hay contenido disponible para ${activeCategory}`
                    }
                  </p>
                </div>
                
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      refetch();
                    }}
                    className="px-6 py-2 bg-gray-700/70 text-white border-none rounded-xl 
                             hover:bg-gray-600/70 transition-all duration-300 cursor-pointer backdrop-blur-sm"
                  >
                    Limpiar búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div>
                {/* Encabezado de resultados */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className="flex items-center gap-4">
                    <p className="text-gray-400 text-base sm:text-lg">
                      {searchQuery 
                        ? `${filteredTeorias.length} resultados para "${searchQuery}"`
                        : `${filteredTeorias.length} temas en ${activeCategory === 'Todas' ? 'todas las categorías' : activeCategory}`
                      }
                    </p>
                    {filteredTeorias.length > 0 && (
                      <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-sm 
                                     rounded-full border border-cyan-400/30">
                        Disponibles
                      </span>
                    )}
                  </div>
                </div>

                {/* Grid o Lista de teorías */}
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                    {filteredTeorias.map((teoria) => (
                      <TeoriaCard key={teoria.id} teoria={teoria} />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-5">
                    {filteredTeorias.map((teoria) => (
                      <TeoriaListItem key={teoria.id} teoria={teoria} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Panel lateral de detalles */}
      {teoriaSeleccionada && !showFullScreen && (
        <aside className="fixed right-0 top-0 w-full sm:w-[28rem] h-screen 
                        bg-gradient-to-br from-slate-800/98 to-slate-900/98 backdrop-blur-xl 
                        border-l border-gray-700/30 flex flex-col z-50 
                        shadow-2xl shadow-black/20 overflow-hidden">
          
          {/* Header del panel */}
          <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-700/30 flex-shrink-0">
            <div className="flex justify-between items-start mb-4 sm:mb-6">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold 
                                  backdrop-blur-sm border ${getCategoriaConfig(teoriaSeleccionada.categoria).bg} 
                                  ${getCategoriaConfig(teoriaSeleccionada.categoria).border} text-white/90`}>
                    <span className="mr-1.5">{getCategoriaConfig(teoriaSeleccionada.categoria).icon}</span>
                    {teoriaSeleccionada.categoria}
                  </span>
                  
                  {isTeoriaLeida(teoriaSeleccionada.id) && (
                    <div className="relative">
                      <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                      <div className="absolute inset-0 bg-green-400/20 rounded-full animate-pulse" />
                    </div>
                  )}
                </div>
                
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight line-clamp-3">
                  {teoriaSeleccionada.titulo}
                </h2>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFullScreen(true)}
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-300 group"
                  title="Ver en pantalla completa"
                >
                  <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-cyan-400" />
                </button>
                <button
                  onClick={() => setTeoriaSeleccionada(null)}
                  className="p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-300 group"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-red-400" />
                </button>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {!isTeoriaLeida(teoriaSeleccionada.id) && (
                <button
                  onClick={() => handleMarkAsRead(teoriaSeleccionada.id)}
                  className="flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 
                           text-white rounded-xl font-medium shadow-lg shadow-green-500/25 text-xs sm:text-sm
                           hover:from-green-400 hover:to-green-500 hover:shadow-xl hover:shadow-green-500/35
                           transition-all duration-300"
                >
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Marcar como leído
                </button>
              )}
              
              <button
                onClick={() => handleStartSimulation(teoriaSeleccionada)}
                className="flex items-center px-3 sm:px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 
                         text-white rounded-xl font-medium shadow-lg shadow-cyan-500/25 text-xs sm:text-sm
                         hover:from-cyan-400 hover:to-blue-400 hover:shadow-xl hover:shadow-cyan-500/35
                         transition-all duration-300"
              >
                <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Simular
              </button>

              <button 
                onClick={() => handleSaveTeoria(teoriaSeleccionada)}
                className={`flex items-center px-3 sm:px-4 py-2 rounded-xl font-medium backdrop-blur-sm 
                         transition-all duration-300 text-xs sm:text-sm ${
                           isTeoriaGuardada(teoriaSeleccionada.id)
                             ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-400/30 hover:bg-yellow-500/30'
                             : 'bg-gray-700/70 text-white hover:bg-gray-600/70'
                         }`}
              >
                <Star className={`w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 ${isTeoriaGuardada(teoriaSeleccionada.id) ? 'fill-current' : ''}`} />
                {isTeoriaGuardada(teoriaSeleccionada.id) ? 'Guardado' : 'Guardar'}
              </button>

              <button
                onClick={() => handleDownloadTeoria(teoriaSeleccionada)}
                className="flex items-center px-3 sm:px-4 py-2 bg-gray-700/70 text-white rounded-xl 
                         font-medium backdrop-blur-sm hover:bg-gray-600/70 transition-all duration-300 text-xs sm:text-sm"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Descargar
              </button>
            </div>
          </div>

          {/* Contenido del panel - Scroll mejorado */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
              {/* Información básica */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-700/20">
                  <div className="flex items-center text-gray-400 text-xs sm:text-sm mb-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span>Duración</span>
                  </div>
                  <span className="text-white font-semibold text-sm sm:text-base">10-15 min</span>
                </div>
                
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-gray-700/20">
                  <div className="flex items-center text-gray-400 text-xs sm:text-sm mb-2">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                    <span>Nivel</span>
                  </div>
                  <span className="text-white font-semibold text-sm sm:text-base">Intermedio</span>
                </div>
              </div>

              {/* Contenido principal */}
              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="flex items-center text-lg sm:text-xl font-bold text-white">
                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-cyan-400" />
                    Contenido
                  </h3>
                  <button
                    onClick={() => setShowFullScreen(true)}
                    className="flex items-center text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 
                             transition-colors duration-300"
                  >
                    <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                    Expandir
                  </button>
                </div>
                
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/20">
                  <div 
                    className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap max-h-80 overflow-y-auto
                             scrollbar-thin scrollbar-track-gray-800 scrollbar-thumb-cyan-500"
                    dangerouslySetInnerHTML={{ 
                      __html: teoriaSeleccionada.contenido.replace(/\n/g, '<br/>') 
                    }}
                  />
                </div>
              </div>

              {/* Tareas relacionadas */}
              {tareas && tareas.length > 0 && (
                <div>
                  <h3 className="flex items-center text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-cyan-400" />
                    Ejercicios Prácticos
                  </h3>
                  
                  <div className="space-y-4">
                    {tareas.map((tarea) => (
                      <div key={tarea.id} className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-5 
                                                    border border-gray-700/20 hover:border-cyan-400/30 
                                                    transition-all duration-300">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold text-white text-sm sm:text-base">Ejercicio {tarea.id}</h4>
                          {tarea.dificultad && (
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border
                                           ${getDificultadColor(tarea.dificultad)}`}>
                              {tarea.dificultad}
                            </span>
                          )}
                        </div>
                        
                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4">
                          {tarea.descripcion_tarea}
                        </p>
                        
                        <button
                          onClick={() => handleStartSimulation(teoriaSeleccionada)}
                          className="flex items-center text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 
                                   transition-colors duration-300"
                        >
                          <Play className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          Realizar ejercicio
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recursos adicionales */}
              <div>
                <h3 className="flex items-center text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">
                  <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-cyan-400" />
                  Recursos Adicionales
                </h3>
                
                <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/20 space-y-4">
                  <a href="#" className="flex items-center text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 
                                       p-3 rounded-lg hover:bg-gray-700/30 transition-all duration-300">
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-3" />
                    <span>Videos explicativos</span>
                  </a>
                  
                  <a href="#" className="flex items-center text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 
                                       p-3 rounded-lg hover:bg-gray-700/30 transition-all duration-300">
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-3" />
                    <span>Ejemplos interactivos</span>
                  </a>
                  
                  <a href="#" className="flex items-center text-xs sm:text-sm text-cyan-400 hover:text-cyan-300 
                                       p-3 rounded-lg hover:bg-gray-700/30 transition-all duration-300">
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 mr-3" />
                    <span>Bibliografía recomendada</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Footer del panel */}
          <div className="p-4 sm:p-6 lg:p-8 border-t border-gray-700/30 flex-shrink-0 space-y-3 sm:space-y-4">
            <button
              onClick={() => handleStartSimulation(teoriaSeleccionada)}
              className="w-full flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 
                       bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl 
                       font-semibold shadow-lg shadow-cyan-500/25 text-sm sm:text-base
                       hover:from-cyan-400 hover:to-blue-400 hover:shadow-xl hover:shadow-cyan-500/35
                       transition-all duration-300"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Ir a Simulación
            </button>
            
            <button
              onClick={() => setTeoriaSeleccionada(null)}
              className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-gray-700/70 text-white rounded-xl font-semibold 
                       backdrop-blur-sm hover:bg-gray-600/70 transition-all duration-300 text-sm sm:text-base"
            >
              Cerrar
            </button>
          </div>
        </aside>
      )}

      {/* Modal de pantalla completa - Responsive mejorado */}
      {showFullScreen && teoriaSeleccionada && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 backdrop-blur-xl 
                        rounded-2xl w-full max-w-7xl h-[95vh] sm:h-[90vh] border border-gray-700/30 
                        shadow-2xl shadow-black/50 flex flex-col overflow-hidden">
            
            {/* Header del modal */}
            <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-700/30 flex-shrink-0">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 pr-4 sm:pr-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className={`inline-flex items-center px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-semibold 
                                    backdrop-blur-sm border ${getCategoriaConfig(teoriaSeleccionada.categoria).bg} 
                                    ${getCategoriaConfig(teoriaSeleccionada.categoria).border} text-white/90`}>
                      <span className="mr-1 sm:mr-2">{getCategoriaConfig(teoriaSeleccionada.categoria).icon}</span>
                      {teoriaSeleccionada.categoria}
                    </span>
                    
                    {isTeoriaLeida(teoriaSeleccionada.id) && (
                      <div className="relative">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                        <div className="absolute inset-0 bg-green-400/20 rounded-full animate-pulse" />
                      </div>
                    )}
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                    {teoriaSeleccionada.titulo}
                  </h2>

                  <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-gray-400 text-sm sm:text-base">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span>10-15 minutos</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span>Nivel Intermedio</span>
                    </div>
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      <span>Lectura</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleShareTeoria(teoriaSeleccionada)}
                    className="p-2 sm:p-3 rounded-xl hover:bg-gray-700/50 transition-all duration-300 group" 
                    title="Compartir">
                    <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-cyan-400" />
                  </button>
                  <button 
                    onClick={() => handleSaveTeoria(teoriaSeleccionada)}
                    className={`p-2 sm:p-3 rounded-xl transition-all duration-300 group ${
                      isTeoriaGuardada(teoriaSeleccionada.id)
                        ? 'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'
                        : 'hover:bg-gray-700/50 text-gray-400 group-hover:text-yellow-400'
                    }`} 
                    title="Guardar">
                    <Star className={`w-5 h-5 sm:w-6 sm:h-6 ${isTeoriaGuardada(teoriaSeleccionada.id) ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={() => handleDownloadTeoria(teoriaSeleccionada)}
                    className="p-2 sm:p-3 rounded-xl hover:bg-gray-700/50 transition-all duration-300 group"
                    title="Descargar"
                  >
                    <Download className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-cyan-400" />
                  </button>
                  <button
                    onClick={() => setShowFullScreen(false)}
                    className="p-2 sm:p-3 rounded-xl hover:bg-gray-700/50 transition-all duration-300 group"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 group-hover:text-red-400" />
                  </button>
                </div>
              </div>

              {/* Botones de acción del modal */}
              <div className="flex flex-wrap gap-3 sm:gap-4">
                {!isTeoriaLeida(teoriaSeleccionada.id) && (
                  <button
                    onClick={() => handleMarkAsRead(teoriaSeleccionada.id)}
                    className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 
                             text-white rounded-xl font-semibold shadow-lg shadow-green-500/25 text-sm sm:text-base
                             hover:from-green-400 hover:to-green-500 hover:shadow-xl hover:shadow-green-500/35
                             transition-all duration-300"
                  >
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Marcar como leído
                  </button>
                )}
                
                <button
                  onClick={() => handleStartSimulation(teoriaSeleccionada)}
                  className="flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-cyan-500 to-blue-500 
                           text-white rounded-xl font-semibold shadow-lg shadow-cyan-500/25 text-sm sm:text-base
                           hover:from-cyan-400 hover:to-blue-400 hover:shadow-xl hover:shadow-cyan-500/35
                           transition-all duration-300"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Ir a Simulación
                </button>
              </div>
            </div>

            {/* Contenido del modal - Scroll corregido */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                  <div className="bg-slate-800/30 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-gray-700/20">
                    <div 
                      className="text-gray-300 text-base sm:text-lg leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ 
                        __html: teoriaSeleccionada.contenido.replace(/\n/g, '<br/>') 
                      }}
                    />
                  </div>

                  {/* Tareas en modal */}
                  {tareas && tareas.length > 0 && (
                    <div>
                      <h3 className="flex items-center text-xl sm:text-2xl font-bold text-white mb-6">
                        <Target className="w-6 h-6 sm:w-7 sm:h-7 mr-3 text-cyan-400" />
                        Ejercicios Prácticos Relacionados
                      </h3>
                      
                      <div className="grid gap-6">
                        {tareas.map((tarea) => (
                          <div key={tarea.id} className="bg-slate-800/40 backdrop-blur-sm rounded-xl p-6 
                                                        border border-gray-700/20 hover:border-cyan-400/30 
                                                        transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                              <h4 className="text-lg font-semibold text-white">Ejercicio {tarea.id}</h4>
                              {tarea.dificultad && (
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border
                                               ${getDificultadColor(tarea.dificultad)}`}>
                                  {tarea.dificultad}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-gray-400 leading-relaxed mb-4">
                              {tarea.descripcion_tarea}
                            </p>
                            
                            <button
                              onClick={() => handleStartSimulation(teoriaSeleccionada)}
                              className="flex items-center px-4 py-2 bg-cyan-500/20 text-cyan-400 
                                       border border-cyan-400/20 rounded-lg hover:bg-cyan-500/30 
                                       hover:text-cyan-300 transition-all duration-300"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              Realizar ejercicio
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeoriaPage;