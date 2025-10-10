// frontend/src/components/simulador/PanelControlSimulacion.tsx - DARK THEME
import React, { useState, useMemo } from 'react';
import { 
  Play, Atom, FlaskConical, Target, 
  Plus, TestTube, Flame, Search, X, Info, Sparkles, Star, Filter
} from 'lucide-react';
import type { Elemento, Utensilio } from '../../types/simulacion.types';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORES_CATEGORIA } from '../../types/simulacion.types';

interface PanelControlSimulacionProps {
  elementos: Elemento[];
  utensilios: Utensilio[];
  onAgregarUtensilio: (utensilio: Utensilio) => void;
  onSeleccionarElemento: (elemento: Elemento) => void;
  onIniciarSimulacion: () => void;
  simulacionActiva: boolean;
  elementoSeleccionado: Elemento | null;
}

type Tab = 'elementos' | 'utensilios' | 'seleccion';

const PanelControlSimulacion: React.FC<PanelControlSimulacionProps> = ({
  elementos,
  utensilios,
  onAgregarUtensilio,
  onSeleccionarElemento,
  onIniciarSimulacion,
  simulacionActiva,
  elementoSeleccionado
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('elementos');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('Todos');
  const [showFilters, setShowFilters] = useState(false);

  const filteredElementos = useMemo(() => {
    return elementos.filter(elemento => {
      const matchSearch = elemento.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         elemento.simbolo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategoria = categoriaFiltro === 'Todos' || elemento.categoria === categoriaFiltro;
      return matchSearch && matchCategoria;
    });
  }, [elementos, searchTerm, categoriaFiltro]);

  const filteredUtensilios = useMemo(() => {
    return utensilios.filter(utensilio =>
      utensilio.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [utensilios, searchTerm]);

  const categorias = useMemo(() => {
    const cats = new Set(elementos.map(e => e.categoria));
    return ['Todos', ...Array.from(cats)];
  }, [elementos]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-slate-900/95 to-slate-950/95 backdrop-blur-2xl">
      {/* ==================== HEADER ==================== */}
      <div className="p-5 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-900/20 via-purple-900/20 to-blue-900/20">
        <motion.h2 
          className="text-2xl font-bold text-white mb-5 flex items-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <div className="relative mr-3">
            <div className="absolute inset-0 bg-cyan-500/30 blur-lg rounded-full" />
            <Atom className="relative w-7 h-7 text-cyan-400 animate-spin-slow" />
          </div>
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Panel de Control
          </span>
        </motion.h2>

        {/* Botón Iniciar */}
        <motion.button
          onClick={onIniciarSimulacion}
          disabled={simulacionActiva}
          className={`w-full mb-4 px-6 py-3 rounded-xl flex items-center justify-center font-bold text-white transition-all duration-300 shadow-lg relative overflow-hidden group ${
            simulacionActiva
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:shadow-cyan-500/50'
          }`}
          whileHover={simulacionActiva ? {} : { scale: 1.02 }}
          whileTap={simulacionActiva ? {} : { scale: 0.98 }}
        >
          {!simulacionActiva && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          )}
          
          {simulacionActiva && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: [-200, 400] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          )}
          
          <div className="relative z-10 flex items-center">
            <Play className={`w-5 h-5 mr-2 ${simulacionActiva ? 'animate-pulse' : ''}`} />
            {simulacionActiva ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Simulación Activa
              </>
            ) : (
              '🚀 Iniciar Simulación'
            )}
          </div>
        </motion.button>

        {/* Barra de búsqueda */}
        <motion.div 
          className="relative"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cyan-400 z-10" />
            <input
              type="text"
              placeholder="🔬 Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-800/50 border border-cyan-500/20 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent backdrop-blur-sm transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* ==================== TABS ==================== */}
      <div className="px-5 py-3 border-b border-cyan-500/20 bg-slate-900/50">
        <nav className="grid grid-cols-3 gap-2">
          <TabButton
            icon={<Atom className="w-4 h-4" />}
            label="Elementos"
            active={activeTab === 'elementos'}
            onClick={() => setActiveTab('elementos')}
            count={elementos.length}
          />
          <TabButton
            icon={<FlaskConical className="w-4 h-4" />}
            label="Utensilios"
            active={activeTab === 'utensilios'}
            onClick={() => setActiveTab('utensilios')}
            count={utensilios.length}
          />
          <TabButton
            icon={<Target className="w-4 h-4" />}
            label="Selección"
            active={activeTab === 'seleccion'}
            onClick={() => setActiveTab('seleccion')}
            badge={elementoSeleccionado ? '●' : ''}
          />
        </nav>
      </div>

      {/* ==================== CONTENIDO ==================== */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <AnimatePresence mode="wait">
          {/* TAB ELEMENTOS */}
          {activeTab === 'elementos' && (
            <motion.div
              key="elementos"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Filtros de categorías */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-cyan-400 flex items-center">
                  <Atom className="w-4 h-4 mr-2 animate-pulse" />
                  Elementos ({filteredElementos.length})
                </h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="p-2 bg-slate-800/50 hover:bg-slate-700/50 rounded-lg transition-all"
                >
                  <Filter className="w-4 h-4 text-cyan-400" />
                </button>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex flex-wrap gap-2 mb-4 overflow-hidden"
                  >
                    {categorias.map(cat => (
                      <motion.button
                        key={cat}
                        onClick={() => setCategoriaFiltro(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          categoriaFiltro === cat
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white border border-cyan-400'
                            : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 border border-slate-700'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {cat}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="grid grid-cols-2 gap-3">
                {filteredElementos.map((elemento, index) => (
                  <ElementoCard
                    key={elemento.id}
                    elemento={elemento}
                    onClick={() => onSeleccionarElemento(elemento)}
                    isSelected={elementoSeleccionado?.id === elemento.id}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB UTENSILIOS */}
          {activeTab === 'utensilios' && (
            <motion.div
              key="utensilios"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <h3 className="text-sm font-semibold text-purple-400 mb-4 flex items-center">
                <FlaskConical className="w-4 h-4 mr-2 animate-pulse" />
                Utensilios ({filteredUtensilios.length})
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {filteredUtensilios.map((utensilio, index) => (
                  <UtensilioCard
                    key={utensilio.id}
                    utensilio={utensilio}
                    onClick={() => onAgregarUtensilio(utensilio)}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB SELECCIÓN */}
          {activeTab === 'seleccion' && (
            <motion.div
              key="seleccion"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-8"
            >
              {elementoSeleccionado ? (
                <motion.div 
                  className="bg-gradient-to-br from-slate-800/60 via-slate-900/60 to-black/60 rounded-2xl p-6 border border-cyan-500/30 shadow-2xl relative overflow-hidden backdrop-blur-sm"
                  initial={{ scale: 0.8, rotateY: -15 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-purple-500/5 to-blue-500/5 animate-pulse" />
                  
                  <div className="relative z-10">
                    <motion.div 
                      className="text-8xl font-bold mb-4 relative"
                      animate={{ 
                        scale: [1, 1.05, 1],
                        textShadow: [
                          '0 0 20px rgba(6, 182, 212, 0.5)',
                          '0 0 40px rgba(6, 182, 212, 0.8)',
                          '0 0 20px rgba(6, 182, 212, 0.5)'
                        ]
                      }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <span className="bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {elementoSeleccionado.simbolo}
                      </span>
                      
                      <div className="absolute inset-0 blur-3xl opacity-50 bg-gradient-to-br from-cyan-500 to-purple-500" />
                    </motion.div>

                    <motion.div 
                      className="text-2xl font-bold text-white mb-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {elementoSeleccionado.nombre}
                    </motion.div>

                    <motion.p 
                      className="text-xs text-slate-300 mb-5 leading-relaxed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      {elementoSeleccionado.descripcion}
                    </motion.p>

                    <div className="grid grid-cols-2 gap-2 mb-5">
                      <PropertyCard
                        label="Estado"
                        value={elementoSeleccionado.estado}
                        color="from-cyan-500/10 to-blue-500/10"
                        borderColor="border-cyan-400/20"
                        delay={0.4}
                      />
                      <PropertyCard
                        label="Categoría"
                        value={elementoSeleccionado.categoria}
                        color="from-purple-500/10 to-pink-500/10"
                        borderColor="border-purple-400/20"
                        delay={0.5}
                      />
                      {elementoSeleccionado.numero_atomico && (
                        <PropertyCard
                          label="N° Atómico"
                          value={elementoSeleccionado.numero_atomico.toString()}
                          color="from-blue-500/10 to-indigo-500/10"
                          borderColor="border-blue-400/20"
                          delay={0.6}
                        />
                      )}
                      {elementoSeleccionado.masa_atomica && (
                        <PropertyCard
                          label="Masa Atómica"
                          value={elementoSeleccionado.masa_atomica.toFixed(2)}
                          color="from-green-500/10 to-emerald-500/10"
                          borderColor="border-green-400/20"
                          delay={0.7}
                        />
                      )}
                    </div>

                    <motion.div 
                      className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mt-4 relative overflow-hidden"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 animate-pulse" />
                      <div className="relative z-10">
                        <Info className="w-4 h-4 text-yellow-400 mx-auto mb-2 animate-bounce" />
                        <p className="text-xs text-yellow-200 font-medium">
                          Haz clic en un utensilio en la escena 3D para agregar este elemento
                        </p>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="text-slate-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Target className="w-20 h-20 mx-auto mb-5 opacity-30 animate-pulse" />
                  <p className="text-lg font-semibold mb-2">Sin Selección</p>
                  <p className="text-xs text-slate-500">
                    Selecciona un elemento químico para ver sus detalles aquí
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================== FOOTER ==================== */}
      <div className="p-4 border-t border-cyan-500/20 bg-slate-900/90">
        <div className="flex items-center text-xs text-slate-400">
          <Info className="w-3 h-3 mr-2 text-cyan-400 animate-pulse" />
          <span className="text-slate-300">
            <strong className="text-cyan-400">Tip:</strong> Combina 2+ elementos para reacciones
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

// ============================================
// COMPONENTE: BOTÓN DE TAB
// ============================================
const TabButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  count?: number;
  badge?: string;
}> = ({ icon, label, active, onClick, count, badge }) => (
  <motion.button
    onClick={onClick}
    className={`relative flex flex-col items-center justify-center px-2 py-2.5 rounded-lg transition-all duration-300 overflow-hidden ${
      active
        ? 'bg-gradient-to-br from-cyan-600/80 to-blue-600/80 text-white shadow-lg border border-cyan-400/50'
        : 'bg-slate-800/30 text-slate-300 hover:bg-slate-700/40 hover:text-white border border-slate-700/50'
    }`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {active && (
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        animate={{ x: [-100, 200] }}
        transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
      />
    )}
    
    <div className="relative z-10">
      {icon}
      <span className="text-[10px] font-semibold mt-1 block">{label}</span>
    </div>
    
    {count !== undefined && (
      <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] rounded-full font-bold ${
        active ? 'bg-white text-cyan-600' : 'bg-cyan-500 text-white'
      }`}>
        {count}
      </span>
    )}
    {badge && (
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse border border-slate-800"></span>
    )}
  </motion.button>
);

// ============================================
// COMPONENTE: TARJETA DE ELEMENTO
// ============================================
const ElementoCard: React.FC<{
  elemento: Elemento;
  onClick: () => void;
  isSelected: boolean;
  index: number;
}> = ({ elemento, onClick, isSelected, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoriaColor = () => {
    const baseColor = COLORES_CATEGORIA[elemento.categoria] || '#4A90E2';
    return {
      from: baseColor,
      to: adjustColor(baseColor, -20),
      border: baseColor
    };
  };

  const colors = getCategoriaColor();

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full p-3 rounded-xl border transition-all duration-300 text-left backdrop-blur-sm relative overflow-hidden group ${
        isSelected
          ? 'shadow-xl scale-105 z-10'
          : 'bg-slate-800/30 border-slate-700/50 hover:scale-105'
      }`}
      style={{
        borderColor: isSelected ? colors.border : '#334155',
        background: isSelected 
          ? `linear-gradient(135deg, ${colors.from}30 0%, ${colors.to}30 100%)`
          : undefined
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      {(isHovered || isSelected) && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: [-200, 200] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-2">
          <motion.span 
            className="text-3xl font-bold"
            style={{ color: colors.from }}
            animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {elemento.simbolo}
          </motion.span>
          <motion.div
            animate={isHovered ? { rotate: 90 } : {}}
            transition={{ duration: 0.3 }}
            className={`p-1.5 rounded-lg ${isSelected ? 'bg-white/20' : 'bg-slate-700/50'}`}
          >
            <Plus className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-cyan-400'}`} />
          </motion.div>
        </div>
        
        <div className={`text-xs font-bold mb-1 truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
          {elemento.nombre}
        </div>
        
        <div className="flex justify-between items-center text-[10px]">
          <span className={`${isSelected ? 'text-white/90' : 'text-slate-400'}`}>
            {elemento.estado}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[9px] ${
            isSelected 
              ? 'bg-white/20 text-white' 
              : 'bg-black/30 text-slate-300'
          }`}>
            {elemento.categoria}
          </span>
        </div>
      </div>

      {isSelected && (
        <motion.div
          className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
        </motion.div>
      )}
    </motion.button>
  );
};

// ============================================
// COMPONENTE: TARJETA DE UTENSILIO
// ============================================
const UtensilioCard: React.FC<{
  utensilio: Utensilio;
  onClick: () => void;
  index: number;
}> = ({ utensilio, onClick, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getIcono = () => {
    const nombre = utensilio.nombre.toLowerCase();
    if (nombre.includes('mechero') || nombre.includes('bunsen')) {
      return <Flame className="w-10 h-10" />;
    }
    if (nombre.includes('tubo')) {
      return <TestTube className="w-10 h-10" />;
    }
    return <FlaskConical className="w-10 h-10" />;
  };

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full p-3 bg-gradient-to-br from-slate-800/40 to-slate-900/40 hover:from-purple-700/30 hover:to-blue-700/30 rounded-xl border border-slate-700/50 hover:border-purple-400/50 transition-all duration-300 text-left group shadow-lg relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.03 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: [-200, 200] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}

      <div className="relative z-10">
        <motion.div 
          className="flex items-center justify-center mb-2 text-purple-400 group-hover:text-white transition-colors"
          animate={isHovered ? { scale: 1.2, rotate: 360 } : {}}
          transition={{ duration: 0.6 }}
        >
          {getIcono()}
        </motion.div>
        
        <div className="text-xs font-semibold text-white text-center line-clamp-2 group-hover:text-purple-100 transition-colors mb-2">
          {utensilio.nombre}
        </div>
        
        <motion.div
          className="text-[10px] text-center text-slate-400 group-hover:text-white transition-colors flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Plus className="w-3 h-3 mr-1" />
          <span>Agregar</span>
        </motion.div>
      </div>

      {utensilio.capacidad && (
        <div className="absolute top-1 right-1 bg-purple-500/20 px-2 py-0.5 rounded-full text-[9px] text-purple-300 border border-purple-500/30">
          {utensilio.capacidad}ml
        </div>
      )}
    </motion.button>
  );
};

// ============================================
// COMPONENTE: TARJETA DE PROPIEDAD
// ============================================
const PropertyCard: React.FC<{
  label: string;
  value: string;
  color: string;
  borderColor: string;
  delay: number;
}> = ({ label, value, color, borderColor, delay }) => (
  <motion.div
    className={`bg-gradient-to-br ${color} px-3 py-2 rounded-lg border ${borderColor} relative overflow-hidden`}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: "spring" }}
    whileHover={{ scale: 1.05 }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent" />
    <div className="relative z-10">
      <div className="text-[10px] text-slate-400 mb-0.5">{label}</div>
      <div className="text-xs font-bold text-white">{value}</div>
    </div>
  </motion.div>
);

// ============================================
// FUNCIÓN AUXILIAR
// ============================================
function adjustColor(color: string, amount: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

export default PanelControlSimulacion;