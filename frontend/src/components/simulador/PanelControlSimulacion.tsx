// frontend/src/components/simulador/PanelControlSimulacion.tsx
import React, { useState, useMemo } from 'react';
import { 
  Play, Atom, FlaskConical, Target, 
  Plus, TestTube, Flame, Search, X, Info
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

  // ============================================
  // FILTRADO INTELIGENTE
  // ============================================
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

  // Categorías únicas de elementos
  const categorias = useMemo(() => {
    const cats = new Set(elementos.map(e => e.categoria));
    return ['Todos', ...Array.from(cats)];
  }, [elementos]);

  return (
    <motion.aside 
      className="w-96 bg-gradient-to-b from-gray-800/95 to-gray-900/95 backdrop-blur-xl border-r border-cyan-500/30 flex flex-col h-screen overflow-hidden shadow-2xl"
      initial={{ x: -400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
    >
      {/* ==================== HEADER ==================== */}
      <div className="p-6 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-900/40 to-purple-900/40">
        <motion.h2 
          className="text-2xl font-bold text-white mb-6 text-center pb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Atom className="inline w-7 h-7 mr-2 text-cyan-400" />
          Panel de Control
        </motion.h2>

        {/* Botón Iniciar Simulación */}
        <motion.button
          onClick={onIniciarSimulacion}
          disabled={simulacionActiva}
          className={`w-full mb-5 px-6 py-4 rounded-2xl flex items-center justify-center font-bold text-white transition-all duration-300 shadow-2xl relative overflow-hidden ${
            simulacionActiva
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 hover:shadow-cyan-500/50'
          }`}
          whileHover={simulacionActiva ? {} : { scale: 1.02, y: -2 }}
          whileTap={simulacionActiva ? {} : { scale: 0.98 }}
        >
          {simulacionActiva && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: [-200, 400] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
          )}
          <Play className={`w-6 h-6 mr-3 ${simulacionActiva ? 'animate-pulse' : ''}`} />
          {simulacionActiva ? '✓ Simulación Activa' : '🚀 Iniciar Simulación'}
        </motion.button>

        {/* Barra de búsqueda */}
        <motion.div 
          className="relative mb-5"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="🔍 Buscar elementos o utensilios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-10 py-3 bg-gray-700/50 border border-cyan-500/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent backdrop-blur-sm transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </motion.div>

        {/* Navegación de tabs */}
        <nav className="grid grid-cols-3 gap-2">
          <TabButton
            icon={<Atom className="w-5 h-5" />}
            label="Elementos"
            active={activeTab === 'elementos'}
            onClick={() => setActiveTab('elementos')}
            count={elementos.length}
          />
          <TabButton
            icon={<FlaskConical className="w-5 h-5" />}
            label="Utensilios"
            active={activeTab === 'utensilios'}
            onClick={() => setActiveTab('utensilios')}
            count={utensilios.length}
          />
          <TabButton
            icon={<Target className="w-5 h-5" />}
            label="Selección"
            active={activeTab === 'seleccion'}
            onClick={() => setActiveTab('seleccion')}
            badge={elementoSeleccionado ? '●' : ''}
          />
        </nav>
      </div>

      {/* ==================== CONTENIDO PRINCIPAL ==================== */}
      <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-800/50 to-gray-900/50 custom-scrollbar">
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
              {/* Filtro por categoría */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categorias.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoriaFiltro(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      categoriaFiltro === cat
                        ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/50'
                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <h3 className="text-lg font-semibold text-cyan-400 mb-4 flex items-center">
                <Atom className="w-5 h-5 mr-2" />
                Elementos Químicos ({filteredElementos.length})
              </h3>
              
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
              <h3 className="text-lg font-semibold text-purple-400 mb-4 flex items-center">
                <FlaskConical className="w-5 h-5 mr-2" />
                Utensilios de Laboratorio ({filteredUtensilios.length})
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
                  className="bg-gradient-to-br from-cyan-900/40 to-purple-900/40 rounded-3xl p-8 border-2 border-cyan-500/40 shadow-2xl"
                  initial={{ scale: 0.8, rotateY: -15 }}
                  animate={{ scale: 1, rotateY: 0 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  {/* Símbolo del elemento */}
                  <motion.div 
                    className="text-8xl font-bold mb-4 bg-gradient-to-br from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
                    animate={{ 
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    {elementoSeleccionado.simbolo}
                  </motion.div>

                  {/* Nombre del elemento */}
                  <div className="text-3xl font-bold text-white mb-2">
                    {elementoSeleccionado.nombre}
                  </div>

                  {/* Descripción */}
                  <p className="text-sm text-gray-300 mb-6 leading-relaxed max-w-md mx-auto">
                    {elementoSeleccionado.descripcion}
                  </p>

                  {/* Propiedades en grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-cyan-500/20 px-4 py-3 rounded-xl border border-cyan-400/30">
                      <div className="text-xs text-cyan-300 mb-1">Estado</div>
                      <div className="text-sm font-bold text-white">{elementoSeleccionado.estado}</div>
                    </div>
                    <div className="bg-purple-500/20 px-4 py-3 rounded-xl border border-purple-400/30">
                      <div className="text-xs text-purple-300 mb-1">Categoría</div>
                      <div className="text-sm font-bold text-white">{elementoSeleccionado.categoria}</div>
                    </div>
                    {elementoSeleccionado.numero_atomico && (
                      <div className="bg-blue-500/20 px-4 py-3 rounded-xl border border-blue-400/30">
                        <div className="text-xs text-blue-300 mb-1">Número Atómico</div>
                        <div className="text-sm font-bold text-white">{elementoSeleccionado.numero_atomico}</div>
                      </div>
                    )}
                    {elementoSeleccionado.masa_atomica && (
                      <div className="bg-green-500/20 px-4 py-3 rounded-xl border border-green-400/30">
                        <div className="text-xs text-green-300 mb-1">Masa Atómica</div>
                        <div className="text-sm font-bold text-white">{elementoSeleccionado.masa_atomica.toFixed(2)}</div>
                      </div>
                    )}
                  </div>

                  {/* Indicación de uso */}
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 mt-4">
                    <Info className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                    <p className="text-xs text-yellow-200">
                      Haz clic en un utensilio en la escena 3D para agregar este elemento
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  className="text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Target className="w-24 h-24 mx-auto mb-6 opacity-30" />
                  <p className="text-xl font-semibold mb-2">Sin Selección</p>
                  <p className="text-sm text-gray-500 max-w-xs mx-auto">
                    Selecciona un elemento químico o utensilio para ver sus detalles aquí
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================== FOOTER CON TIPS ==================== */}
      <div className="p-4 border-t border-cyan-500/30 bg-gradient-to-r from-gray-900/90 to-gray-800/90">
        <div className="flex items-center text-xs text-gray-400">
          <Info className="w-4 h-4 mr-2 text-cyan-400" />
          <span>Tip: Combina al menos 2 elementos para crear reacciones</span>
        </div>
      </div>
    </motion.aside>
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
    className={`flex flex-col items-center justify-center px-3 py-3 rounded-xl transition-all duration-300 relative ${
      active
        ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
    }`}
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
  >
    {icon}
    <span className="text-xs font-semibold mt-1">{label}</span>
    {count !== undefined && (
      <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] rounded-full ${
        active ? 'bg-white text-cyan-600' : 'bg-cyan-500 text-white'
      }`}>
        {count}
      </span>
    )}
    {badge && (
      <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-gray-800"></span>
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
      className={`w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left backdrop-blur-sm relative overflow-hidden ${
        isSelected
          ? 'bg-gradient-to-br shadow-2xl scale-105 z-10'
          : 'bg-gray-700/30 border-gray-600 hover:scale-105'
      }`}
      style={{
        borderColor: isSelected ? colors.border : '#4B5563',
        background: isSelected 
          ? `linear-gradient(135deg, ${colors.from} 0%, ${colors.to} 100%)`
          : undefined
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Efecto de brillo en hover */}
      {(isHovered || isSelected) && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: [-200, 200] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        />
      )}

      {/* Contenido */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <motion.span 
            className="text-4xl font-bold"
            animate={isSelected ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            {elemento.simbolo}
          </motion.span>
          <motion.div
            animate={isHovered ? { rotate: 90 } : {}}
            transition={{ duration: 0.3 }}
          >
            <Plus className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-cyan-400'}`} />
          </motion.div>
        </div>
        
        <div className={`text-sm font-bold mb-1 truncate ${isSelected ? 'text-white' : 'text-gray-200'}`}>
          {elemento.nombre}
        </div>
        
        <div className="flex justify-between items-center text-xs">
          <span className={`${isSelected ? 'text-white/90' : 'text-gray-400'}`}>
            {elemento.estado}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[10px] ${
            isSelected 
              ? 'bg-white/20 text-white' 
              : 'bg-black/30 text-gray-300'
          }`}>
            {elemento.categoria}
          </span>
        </div>
      </div>

      {/* Indicador de selección */}
      {isSelected && (
        <motion.div
          className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500 }}
        >
          <span className="text-xs">✓</span>
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
      return <Flame className="w-12 h-12" />;
    }
    if (nombre.includes('tubo')) {
      return <TestTube className="w-12 h-12" />;
    }
    return <FlaskConical className="w-12 h-12" />;
  };

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="w-full p-4 bg-gradient-to-br from-gray-700/50 to-gray-800/50 hover:from-purple-700/50 hover:to-blue-700/50 rounded-2xl border-2 border-gray-600 hover:border-purple-400 transition-all duration-300 text-left group shadow-lg relative overflow-hidden"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Efecto de brillo */}
      {isHovered && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: [-200, 200] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}

      {/* Contenido */}
      <div className="relative z-10">
        <motion.div 
          className="flex items-center justify-center mb-3 text-purple-400 group-hover:text-white transition-colors"
          animate={isHovered ? { scale: 1.2, rotate: 360 } : {}}
          transition={{ duration: 0.6 }}
        >
          {getIcono()}
        </motion.div>
        
        <div className="text-sm font-semibold text-white text-center line-clamp-2 group-hover:text-purple-100 transition-colors mb-2">
          {utensilio.nombre}
        </div>
        
        <motion.div
          className="text-xs text-center text-gray-400 group-hover:text-white transition-colors flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Plus className="w-3 h-3 mr-1" />
          <span>Agregar a mesa</span>
        </motion.div>
      </div>

      {/* Indicador de capacidad */}
      {utensilio.capacidad && (
        <div className="absolute top-2 right-2 bg-purple-500/20 px-2 py-1 rounded-full text-[10px] text-purple-300 border border-purple-500/30">
          {utensilio.capacidad}ml
        </div>
      )}
    </motion.button>
  );
};

// ============================================
// FUNCIÓN AUXILIAR: AJUSTAR COLOR
// ============================================
function adjustColor(color: string, amount: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

export default PanelControlSimulacion;