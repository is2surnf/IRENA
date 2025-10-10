// frontend/src/pages/SimulacionPage.tsx 
import React, { useEffect, useState } from 'react';
import { useElementos } from '../hooks/useElementos';
import { useUtensilios } from '../hooks/useUtensilios';
import { useSimulacion } from '../hooks/useSimulacion';
import LaboratorioScene from '../components/simulador/LaboratorioScene';
import PanelControlSimulacion from '../components/simulador/PanelControlSimulacion';
import InformeSimulacion from '../components/simulador/InformeSimulacion';
import type { Elemento, Utensilio } from '../types/simulacion.types';
import { 
  RotateCcw, AlertCircle, Atom, Menu, X, 
  ChevronLeft, ChevronRight, Sparkles, 
  FlaskConical, Settings, Maximize2, Minimize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SimulacionPage: React.FC = () => {
  const { elementos, loading: loadingElementos, error: errorElementos } = useElementos();
  const { utensilios, loading: loadingUtensilios, error: errorUtensilios } = useUtensilios();
  
  const {
    estado,
    efectosActivos,
    agregarUtensilio,
    agregarElementoAUtensilio,
    detectarReaccion,
    iniciarReaccion,
    iniciarSimulacion,
    limpiarMesa
  } = useSimulacion();

  const [elementoSeleccionado, setElementoSeleccionado] = React.useState<Elemento | null>(null);
  const [utensilioSeleccionado, setUtensilioSeleccionado] = React.useState<string | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Estados de UI colapsable
  const [isPanelControlOpen, setIsPanelControlOpen] = useState(true);
  const [isPanelInformeOpen, setIsPanelInformeOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // ============================================
  // EFECTOS
  // ============================================
  useEffect(() => {
    if (!estado.activa) return;
    const interval = setInterval(() => {
      // El tiempo se actualiza en el hook useSimulacion
    }, 1000);
    return () => clearInterval(interval);
  }, [estado.activa]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);
  
  // EFECTO PARA ATAJOS DE TECLADO (CORREGIDO)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'p') {
        e.preventDefault();
        setIsPanelControlOpen(prev => !prev);
      }
      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        setIsPanelInformeOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []); // <--- Movido y corregido.

  // ============================================
  // HANDLERS
  // ============================================
  const handleObjectClick = (objeto: any) => {
    if (objeto.tipo === 'utensilio') {
      setUtensilioSeleccionado(objeto.id);
      
      if (elementoSeleccionado) {
        agregarElementoAUtensilio(objeto.id, elementoSeleccionado);
        setElementoSeleccionado(null);
        
        setTimeout(() => {
          detectarReaccion(objeto.id);
        }, 500);
      }
    }
  };

  const handleAgregarUtensilio = (utensilio: Utensilio) => {
    const x = (Math.random() - 0.5) * 6;
    const z = (Math.random() - 0.5) * 3;
    agregarUtensilio(utensilio, [x, 0.1, z]);
  };

  const handleSeleccionarElemento = (elemento: Elemento) => {
    setElementoSeleccionado(elemento);
  };

  const handleGuardar = () => {
    console.log('Guardando simulación...', estado);
    alert('Simulación guardada exitosamente ✅');
  };

  const handleReiniciar = () => {
    if (window.confirm('¿Estás seguro de que quieres reiniciar la simulación?')) {
      limpiarMesa();
      setElementoSeleccionado(null);
      setUtensilioSeleccionado(null);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const utensiliosConElementos = estado.objetosEnMesa
    .filter(obj => obj.tipo === 'utensilio' && obj.contenido && obj.contenido.elementos.length > 0)
    .map(obj => ({
      id: obj.id,
      nombre: (obj.data as Utensilio).nombre,
      cantidadElementos: obj.contenido!.elementos.length
    }));

  // ============================================
  // PANTALLAS DE CARGA Y ERROR
  // ============================================
  if (loadingElementos || loadingUtensilios) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent"></div>
        
        <motion.div 
          className="text-center relative z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity }
            }}
            className="mb-6"
          >
            <Atom className="w-24 h-24 text-cyan-400 mx-auto drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
          </motion.div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Cargando Laboratorio
          </h2>
          <p className="text-gray-400 text-lg">
            Preparando experiencia científica...
          </p>
          
          <motion.div className="flex justify-center mt-6 space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-3 h-3 bg-cyan-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (errorElementos || errorUtensilios) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-red-900/20 to-black text-white items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
        <motion.div 
          className="text-center max-w-md relative z-10"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <AlertCircle className="w-24 h-24 text-red-400 mx-auto mb-6" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            Error en el Sistema
          </h2>
          <p className="text-gray-300 mb-6 text-lg">
            {errorElementos || errorUtensilios}
          </p>
          <motion.button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl font-semibold text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reintentar Conexión
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white relative overflow-hidden">
      {/* ==================== BACKGROUND EFFECTS ==================== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-blue-500/5 rounded-full blur-2xl animate-pulse" style={{animationDelay: '0.5s'}}></div>
      </div>

      {/* ==================== WELCOME ANIMATION ==================== */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-gray-900 to-black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.8, type: "spring" }}
            >
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.3, 1]
                }}
                transition={{ 
                  rotate: { duration: 3, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
                className="mb-8"
              >
                <Sparkles className="w-32 h-32 text-cyan-400 mx-auto drop-shadow-[0_0_30px_rgba(34,211,238,0.8)]" />
              </motion.div>
              <h1 className="text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                IReNaTech
              </h1>
              <p className="text-2xl text-gray-300">Laboratorio Virtual de Química</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== TOP BAR ==================== */}
      <motion.div 
        className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center px-6 py-4 bg-slate-900/80 backdrop-blur-xl border-b border-cyan-500/20"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center space-x-4">
          <motion.div
            whileHover={{ rotate: 180 }}
            transition={{ duration: 0.5 }}
          >
            <FlaskConical className="w-7 h-7 text-cyan-400" />
          </motion.div>
          <div>
            <h1 className="text-xl font-bold text-white">ChemLab Pro</h1>
            <p className="text-gray-400 text-xs">
              {estado.activa ? 'Simulación activa' : 'Listo para experimentar'}
              {estado.objetosEnMesa.length > 0 && ` • ${estado.objetosEnMesa.length} objetos`}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Toggle Panel Control */}
          <motion.button
            onClick={() => setIsPanelControlOpen(!isPanelControlOpen)}
            className="flex items-center space-x-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 px-4 py-2 rounded-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isPanelControlOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <span className="text-sm">Panel</span>
          </motion.button>

          {/* Settings */}
          <motion.button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-400/30 rounded-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Settings className="w-5 h-5 text-purple-400" />
          </motion.button>

          {/* Fullscreen */}
          <motion.button
            onClick={toggleFullscreen}
            className="p-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-400/30 rounded-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5 text-blue-400" /> : <Maximize2 className="w-5 h-5 text-blue-400" />}
          </motion.button>

          {/* Reiniciar */}
          <motion.button
            onClick={handleReiniciar}
            className="flex items-center space-x-2 bg-red-500/10 hover:bg-red-500/20 border border-red-400/30 px-4 py-2 rounded-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">Reiniciar</span>
          </motion.button>
        </div>
      </motion.div>

      {/* ==================== PANEL DE CONTROL LATERAL IZQUIERDO ==================== */}
      <AnimatePresence>
        {isPanelControlOpen && (
          <motion.div
            className="absolute left-0 top-20 bottom-0 z-20 w-[420px]"
            initial={{ x: -420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -420, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="h-full bg-slate-900/90 backdrop-blur-xl border-r border-cyan-500/20 overflow-hidden">
              <PanelControlSimulacion
                elementos={elementos}
                utensilios={utensilios}
                onAgregarUtensilio={handleAgregarUtensilio}
                onSeleccionarElemento={handleSeleccionarElemento}
                onIniciarSimulacion={iniciarSimulacion}
                simulacionActiva={estado.activa}
                elementoSeleccionado={elementoSeleccionado}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== ESCENA 3D CENTRAL ==================== */}
      <div 
        className="flex-1 relative z-10"
        style={{
          marginLeft: isPanelControlOpen ? '420px' : '0',
          marginRight: isPanelInformeOpen ? '420px' : '0',
          marginTop: '80px',
          transition: 'margin 0.3s ease-in-out'
        }}
      >
        <LaboratorioScene
          objetosEnMesa={estado.objetosEnMesa}
          efectosActivos={efectosActivos || undefined}
          onObjectClick={handleObjectClick}
          onObjectMove={(id, position) => {
            console.log('Mover objeto', id, position);
          }}
        />
      </div>

      {/* ==================== PANEL DE INFORME LATERAL DERECHO ==================== */}
      <AnimatePresence>
        {isPanelInformeOpen && (
          <motion.div
            className="absolute right-0 top-20 bottom-0 z-20 w-[420px]"
            initial={{ x: 420, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 420, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="h-full bg-slate-900/90 backdrop-blur-xl border-l border-cyan-500/20 overflow-y-auto custom-scrollbar">
              <InformeSimulacion
                estado={estado}
                reaccionActual={estado.reaccionActual}
                onGuardar={handleGuardar}
                onEliminar={limpiarMesa}
                onIniciarReaccion={iniciarReaccion}
                utensiliosConElementos={utensiliosConElementos}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== BOTÓN FLOTANTE TOGGLE INFORME ==================== */}
      <motion.button
        onClick={() => setIsPanelInformeOpen(!isPanelInformeOpen)}
        className="absolute right-6 top-24 z-30 p-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 rounded-xl backdrop-blur-sm"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {isPanelInformeOpen ? <ChevronRight className="w-5 h-5 text-cyan-400" /> : <ChevronLeft className="w-5 h-5 text-cyan-400" />}
      </motion.button>

      {/* ==================== ESTADO RÁPIDO FLOTANTE ==================== */}
      <motion.div 
        className="absolute bottom-6 left-6 z-20 bg-black/60 backdrop-blur-md rounded-2xl px-6 py-4 text-white text-sm border border-cyan-500/30"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${estado.activa ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className="font-semibold">{estado.activa ? 'Simulación Activa' : 'En Espera'}</span>
          </div>
          <div className="h-4 w-px bg-cyan-500/30"></div>
          <span className="text-cyan-400 font-semibold">{estado.objetosEnMesa.length} objetos en mesa</span>
          {elementoSeleccionado && (
            <>
              <div className="h-4 w-px bg-cyan-500/30"></div>
              <span className="text-yellow-400 font-semibold">{elementoSeleccionado.simbolo} seleccionado</span>
            </>
          )}
        </div>
      </motion.div>

      {/* ==================== PANEL DE SETTINGS ==================== */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              className="bg-slate-800/95 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8 max-w-md w-full mx-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Configuración</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 hover:bg-red-500/20 rounded-xl transition-all"
                >
                  <X className="w-6 h-6 text-red-400" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-700/50 rounded-xl">
                  <h3 className="text-sm font-semibold text-cyan-400 mb-2">Controles</h3>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• <kbd className="px-2 py-1 bg-slate-600 rounded">Click izquierdo</kbd> - Rotar cámara</li>
                    <li>• <kbd className="px-2 py-1 bg-slate-600 rounded">Scroll</kbd> - Zoom</li>
                    <li>• <kbd className="px-2 py-1 bg-slate-600 rounded">Click derecho</kbd> - Mover cámara</li>
                  </ul>
                </div>

                <div className="p-4 bg-slate-700/50 rounded-xl">
                  <h3 className="text-sm font-semibold text-purple-400 mb-2">Atajos de Teclado</h3>
                  <ul className="text-xs text-gray-300 space-y-1">
                    <li>• <kbd className="px-2 py-1 bg-slate-600 rounded">Ctrl + P</kbd> - Toggle Panel Control</li>
                    <li>• <kbd className="px-2 py-1 bg-slate-600 rounded">Ctrl + I</kbd> - Toggle Panel Informe</li>
                    <li>• <kbd className="px-2 py-1 bg-slate-600 rounded">F11</kbd> - Pantalla completa</li>
                  </ul>
                </div>
              </div>

              <motion.button
                onClick={() => setShowSettings(false)}
                className="w-full mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl font-semibold"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Cerrar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== CSS CUSTOM SCROLLBAR ==================== */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #7c3aed);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default SimulacionPage;
