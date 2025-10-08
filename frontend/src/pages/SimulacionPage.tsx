//frontend/src/pages/SimulacionPage.tsx
import React, { useEffect, useState } from 'react';
import { useElementos } from '../hooks/useElementos';
import { useUtensilios } from '../hooks/useUtensilios';
import { useSimulacion } from '../hooks/useSimulacion';
import LaboratorioScene from '../components/simulador/LaboratorioScene';
import PanelControlSimulacion from '../components/simulador/PanelControlSimulacion';
import InformeSimulacion from '../components/simulador/InformeSimulacion';
import type { Elemento, Utensilio } from '../types/simulacion.types';
import { RotateCcw, AlertCircle, Atom, Zap, Sparkles, FlaskConical } from 'lucide-react';
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
  const [isPanelOpen, setIsPanelOpen] = useState(true);

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
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

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

  // Identificar utensilios con elementos para mostrar botón de iniciar reacción
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
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-blue-500/10 animate-pulse"></div>
        
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
            <Atom className="w-20 h-20 text-cyan-400 mx-auto" />
          </motion.div>
          <motion.h2 
            className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Cargando Laboratorio
          </motion.h2>
          <motion.p 
            className="text-gray-400 text-lg"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Preparando experiencia científica...
          </motion.p>
          
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
      <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-gray-900 text-white items-center justify-center relative overflow-hidden">
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
    <div className="flex min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900 text-white relative overflow-hidden">
      {/* ==================== BACKGROUND EFFECTS ==================== */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* ==================== WELCOME ANIMATION ==================== */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900"
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
                <Sparkles className="w-32 h-32 text-cyan-400 mx-auto" />
              </motion.div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4">
                ChemLab 3D
              </h1>
              <p className="text-xl text-gray-300">Laboratorio Virtual de Química</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== PANEL DE CONTROL LATERAL ==================== */}
      <AnimatePresence>
        {isPanelOpen && (
          <PanelControlSimulacion
            elementos={elementos}
            utensilios={utensilios}
            onAgregarUtensilio={handleAgregarUtensilio}
            onSeleccionarElemento={handleSeleccionarElemento}
            onIniciarSimulacion={iniciarSimulacion}
            simulacionActiva={estado.activa}
            elementoSeleccionado={elementoSeleccionado}
          />
        )}
      </AnimatePresence>

      {/* ==================== CONTENIDO PRINCIPAL ==================== */}
      <div className="flex-1 flex flex-col relative z-10">
        {/* ==================== HEADER COMPACTO ==================== */}
        <motion.div 
          className="flex justify-between items-center px-6 py-3 bg-gray-900/80 backdrop-blur-lg border-b border-cyan-500/30"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <FlaskConical className="w-6 h-6 text-cyan-400" />
            </motion.div>
            <div>
              <h1 className="text-lg font-bold text-white">ChemLab Pro</h1>
              <p className="text-gray-400 text-xs">
                {estado.activa ? 'Simulación activa' : 'Listo para experimentar'}
                {estado.objetosEnMesa.length > 0 && ` • ${estado.objetosEnMesa.length} objetos`}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => setIsPanelOpen(!isPanelOpen)}
              className="flex items-center space-x-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 px-3 py-2 rounded-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Atom className="w-4 h-4" />
              <span className="text-sm">{isPanelOpen ? 'Ocultar' : 'Mostrar'} Panel</span>
            </motion.button>

            <motion.button
              onClick={handleReiniciar}
              className="flex items-center space-x-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 px-3 py-2 rounded-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-sm">Reiniciar</span>
            </motion.button>
          </div>
        </motion.div>

        {/* ==================== GRID: ESCENA 3D + PANEL INFORME ==================== */}
        <div className="flex-1 grid" style={{ 
          gridTemplateColumns: isPanelOpen ? '1fr 380px' : '1fr 0px',
          transition: 'grid-template-columns 0.3s ease'
        }}>
          {/* ==================== ESCENA 3D ==================== */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <LaboratorioScene
              objetosEnMesa={estado.objetosEnMesa}
              efectosActivos={efectosActivos || undefined}
              onObjectClick={handleObjectClick}
              onObjectMove={(id, position) => {
                console.log('Mover objeto', id, position);
              }}
            />
          </motion.div>
          
          {/* ==================== PANEL DE INFORME LATERAL ==================== */}
          <AnimatePresence>
            {isPanelOpen && (
              <motion.div 
                className="bg-gray-800/90 backdrop-blur-lg border-l border-cyan-500/30 overflow-hidden"
                initial={{ x: 300, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 300, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="h-full overflow-y-auto custom-scrollbar">
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
        </div>
      </div>

      {/* ==================== ESTADO RÁPIDO FLOTANTE ==================== */}
      <motion.div 
        className="absolute bottom-4 left-4 z-20 bg-black/50 backdrop-blur-sm rounded-2xl p-3 text-white text-sm border border-cyan-500/30"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${estado.activa ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <span>{estado.activa ? 'Simulación activa' : 'En espera'}</span>
          <span className="text-cyan-400">•</span>
          <span>{estado.objetosEnMesa.length} objetos</span>
          {elementoSeleccionado && (
            <>
              <span className="text-cyan-400">•</span>
              <span className="text-cyan-300">{elementoSeleccionado.simbolo} seleccionado</span>
            </>
          )}
        </div>
      </motion.div>

      {/* ==================== BOTÓN FLOTANTE PARA PANEL (cuando está oculto) ==================== */}
      <AnimatePresence>
        {!isPanelOpen && (
          <motion.button
            onClick={() => setIsPanelOpen(true)}
            className="absolute top-20 right-4 z-20 bg-cyan-500 hover:bg-cyan-600 p-3 rounded-2xl shadow-2xl border border-cyan-400/30"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Atom className="w-6 h-6 text-white" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ==================== FLOATING PARTICLES DECORATIVOS ==================== */}
      <div className="absolute bottom-10 right-10 flex space-x-4 z-20 pointer-events-none">
        {[
          { color: 'bg-cyan-400', delay: 0 },
          { color: 'bg-purple-400', delay: 0.5 },
          { color: 'bg-blue-400', delay: 1 }
        ].map((particle, i) => (
          <motion.div
            key={i}
            className={`w-3 h-3 ${particle.color} rounded-full`}
            animate={{
              scale: [1, 2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: particle.delay,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* ==================== CSS CUSTOM SCROLLBAR ==================== */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #06b6d4, #8b5cf6);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #0891b2, #7c3aed);
        }
      `}</style>
    </div>
  );
};

export default SimulacionPage;