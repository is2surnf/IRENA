// frontend/src/components/simulador/InformeSimulacion.tsx
import React, { useState, useEffect } from 'react';
import { 
  Thermometer, Droplet, Activity, Save, Trash2, CheckCircle, 
  AlertCircle, Zap, Clock, Beaker, TrendingUp, Flame, Play, Info
} from 'lucide-react';
import type { EstadoSimulacion, Reaccion } from '../../types/simulacion.types';
import { motion, AnimatePresence } from 'framer-motion';

interface InformeSimulacionProps {
  estado: EstadoSimulacion;
  reaccionActual?: Reaccion;
  onGuardar: () => void;
  onEliminar: () => void;
  onIniciarReaccion?: (utensilioId: string) => void;
  utensiliosConElementos?: Array<{ id: string; nombre: string; cantidadElementos: number }>;
}

const InformeSimulacion: React.FC<InformeSimulacionProps> = ({
  estado,
  reaccionActual,
  onGuardar,
  onEliminar,
  onIniciarReaccion,
  utensiliosConElementos = []
}) => {
  const [currentTime, setCurrentTime] = useState(estado.tiempo);
  const [reaccionEnProceso, setReaccionEnProceso] = useState(false);

  // ============================================
  // EFECTOS
  // ============================================
  useEffect(() => {
    if (estado.activa) {
      const interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [estado.activa]);

  useEffect(() => {
    if (reaccionActual) {
      setReaccionEnProceso(true);
      const timer = setTimeout(() => {
        setReaccionEnProceso(false);
      }, (reaccionActual.efectos.duracion || 5) * 1000);
      return () => clearTimeout(timer);
    }
  }, [reaccionActual]);

  // ============================================
  // FUNCIONES AUXILIARES
  // ============================================
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTendenciaTemperatura = () => {
    if (estado.temperatura > 50) return 'up';
    if (estado.temperatura < 20) return 'down';
    return 'stable';
  };

  const getTendenciaPH = () => {
    if (estado.pH > 8) return 'up';
    if (estado.pH < 6) return 'down';
    return 'stable';
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <motion.div 
      className="w-full bg-gray-800/90 backdrop-blur-xl rounded-3xl p-6 border-2 border-cyan-500/30 shadow-2xl"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.8, type: "spring" }}
    >
      {/* ==================== HEADER ==================== */}
      <div className="flex items-center justify-between mb-6">
        <motion.h2 
          className="text-2xl font-bold text-white flex items-center"
          whileHover={{ scale: 1.03 }}
        >
          <Activity className="w-7 h-7 mr-3 text-cyan-400" />
          <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            Panel Científico
          </span>
        </motion.h2>
        
        <motion.div 
          className="flex items-center space-x-3 bg-cyan-500/20 px-5 py-2 rounded-2xl border border-cyan-400/40"
          whileHover={{ scale: 1.05 }}
        >
          <Clock className="w-5 h-5 text-cyan-400" />
          <span className="text-white font-mono font-bold text-lg">{formatTime(currentTime)}</span>
        </motion.div>
      </div>

      {/* ==================== MÉTRICAS PRINCIPALES ==================== */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <MetricCard
          icon={<Thermometer className="w-7 h-7" />}
          label="Temperatura"
          value={`${estado.temperatura}°C`}
          trend={getTendenciaTemperatura()}
          color="from-red-500 to-orange-500"
          delay={0.1}
        />
        
        <MetricCard
          icon={<Droplet className="w-7 h-7" />}
          label="Nivel de pH"
          value={estado.pH?.toFixed(1) || '7.0'}
          trend={getTendenciaPH()}
          color="from-blue-500 to-cyan-500"
          delay={0.2}
        />
        
        <MetricCard
          icon={<Zap className="w-7 h-7" />}
          label="Estado"
          value={estado.activa ? 'Activo' : 'Espera'}
          trend={estado.activa ? "up" : "stable"}
          color={estado.activa ? "from-green-500 to-emerald-500" : "from-gray-500 to-slate-500"}
          delay={0.3}
        />
      </div>

      {/* ==================== BOTÓN INICIAR REACCIÓN ==================== */}
      {utensiliosConElementos.length > 0 && onIniciarReaccion && !reaccionEnProceso && (
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/40 rounded-2xl p-4 mb-4">
            <div className="flex items-start">
              <Beaker className="w-6 h-6 text-yellow-400 mr-3 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="text-lg font-semibold text-yellow-300 mb-2">
                  🧪 Utensilios listos para reaccionar
                </h4>
                <p className="text-xs text-yellow-200 mb-3 opacity-90">
                  Los siguientes utensilios tienen elementos que pueden reaccionar. Haz clic para iniciar:
                </p>
                <div className="space-y-2">
                  {utensiliosConElementos.map((utensilio) => (
                    <motion.button
                      key={utensilio.id}
                      onClick={() => onIniciarReaccion(utensilio.id)}
                      className="w-full flex items-center justify-between bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl group"
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center">
                        <Play className="w-6 h-6 mr-3 group-hover:animate-pulse" />
                        <div className="text-left">
                          <div className="text-sm font-semibold">{utensilio.nombre}</div>
                          <div className="text-xs opacity-90">
                            {utensilio.cantidadElementos} elemento{utensilio.cantidadElementos > 1 ? 's' : ''} agregado{utensilio.cantidadElementos > 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                      <Flame className="w-6 h-6 animate-pulse" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ==================== REACCIÓN ACTUAL ==================== */}
      <AnimatePresence>
        {reaccionActual && (
          <motion.div
            className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-2 border-cyan-500/50 rounded-2xl p-6 mb-6 shadow-2xl"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="flex items-start mb-4">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CheckCircle className="w-8 h-8 text-green-400 mr-3 flex-shrink-0 mt-1" />
              </motion.div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xl font-bold text-white">
                    {reaccionActual.nombre}
                  </h3>
                  <motion.span
                    className="bg-green-500/30 text-green-300 px-4 py-1.5 rounded-full text-sm font-semibold border border-green-400/50"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    ⚗️ Reacción en Progreso
                  </motion.span>
                </div>

                {/* Fórmula química */}
                <div className="bg-black/30 px-5 py-3 rounded-xl mb-4 border border-cyan-400/20">
                  <p className="text-lg text-cyan-300 font-mono text-center">
                    {reaccionActual.formula}
                  </p>
                </div>

                {/* Descripción */}
                <p className="text-gray-200 leading-relaxed mb-4 text-sm">
                  {reaccionActual.descripcion}
                </p>

                {/* Mensaje de efectos */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3 mb-4">
                  <p className="text-yellow-200 text-sm font-medium">
                    ⚠️ {reaccionActual.efectos.mensaje}
                  </p>
                </div>

                {/* Indicador de peligrosidad */}
                {reaccionActual.peligrosidad && (
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                    reaccionActual.peligrosidad === 'alta' 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                      : reaccionActual.peligrosidad === 'media'
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/50'
                      : 'bg-green-500/20 text-green-300 border border-green-500/50'
                  }`}>
                    {reaccionActual.peligrosidad === 'alta' && '🔴'}
                    {reaccionActual.peligrosidad === 'media' && '🟡'}
                    {reaccionActual.peligrosidad === 'baja' && '🟢'}
                    <span className="ml-2">
                      Peligrosidad: {reaccionActual.peligrosidad.toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Efectos visuales activos */}
            <motion.div 
              className="flex flex-wrap gap-3 mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {reaccionActual.efectos.burbujeo && (
                <EffectBadge icon="💧" label="Burbujeo" color="blue" />
              )}
              {reaccionActual.efectos.humo && (
                <EffectBadge icon="💨" label="Humo" color="gray" />
              )}
              {reaccionActual.efectos.llama && (
                <EffectBadge icon="🔥" label="Llama" color="orange" />
              )}
              {reaccionActual.efectos.precipitado && (
                <EffectBadge icon="⭐" label="Precipitado" color="purple" />
              )}
            </motion.div>

            {/* Barra de progreso de reacción */}
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-400">Progreso de la reacción</span>
                <span className="text-xs text-cyan-400 font-mono">
                  {reaccionEnProceso ? 'En proceso...' : 'Completado'}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ 
                    duration: reaccionActual.efectos.duracion || 5,
                    ease: "linear"
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== ESTADO SIN OBJETOS ==================== */}
      <AnimatePresence>
        {!estado.activa && estado.objetosEnMesa.length === 0 && (
          <motion.div
            className="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/40 rounded-2xl p-6 mb-6 flex items-start"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <AlertCircle className="w-8 h-8 text-yellow-400 mr-4 flex-shrink-0" />
            </motion.div>
            <div>
              <h4 className="text-lg font-semibold text-yellow-300 mb-2">
                🧪 Laboratorio en Espera
              </h4>
              <p className="text-yellow-200 text-sm leading-relaxed">
                Agrega utensilios y elementos químicos desde el panel lateral para comenzar tu experimento científico
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== HISTORIAL DE REACCIONES ==================== */}
      {estado.historialReacciones && estado.historialReacciones.length > 0 && (
        <motion.div
          className="bg-gray-700/50 rounded-2xl p-4 mb-6 border border-gray-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
            <Beaker className="w-4 h-4 mr-2" />
            Historial de Reacciones ({estado.historialReacciones.length})
          </h4>
          <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
            {estado.historialReacciones.map((reaccion, index) => (
              <motion.div
                key={index}
                className="bg-gray-800/50 px-3 py-2 rounded-lg text-xs text-gray-300 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <span className="flex items-center">
                  <span className="text-green-400 mr-2">✓</span>
                  {reaccion.nombre}
                </span>
                <span className="text-cyan-400 font-mono">{reaccion.efectos.temperatura}°C</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ==================== ACCIONES ==================== */}
      <div className="flex gap-4 mb-6">
        <ActionButton
          icon={<Save className="w-5 h-5" />}
          label="Guardar"
          onClick={onGuardar}
          disabled={!estado.activa && estado.objetosEnMesa.length === 0}
          color="from-blue-500 to-cyan-500"
          delay={0.7}
        />
        
        <ActionButton
          icon={<Trash2 className="w-5 h-5" />}
          label="Limpiar"
          onClick={onEliminar}
          color="from-purple-500 to-pink-500"
          delay={0.8}
        />
      </div>

      {/* ==================== PROGRESO GENERAL ==================== */}
      <motion.div 
        className="bg-gray-700/50 rounded-2xl p-4 border border-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
      >
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-300 font-medium flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Progreso del Experimento
          </span>
          <span className="text-sm text-cyan-400 font-bold">
            {Math.min(100, Math.floor((currentTime / 300) * 100))}%
          </span>
        </div>
        <div className="w-full bg-gray-600 rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 h-3"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, Math.floor((currentTime / 300) * 100))}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </motion.div>

      {/* ==================== INFO TIP ==================== */}
      <motion.div
        className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 flex items-start"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <Info className="w-4 h-4 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-blue-200">
          <strong>Tip:</strong> Combina diferentes elementos en los utensilios para descubrir nuevas reacciones químicas.
        </p>
      </motion.div>
    </motion.div>
  );
};

// ============================================
// COMPONENTE: TARJETA DE MÉTRICA
// ============================================
const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: 'up' | 'down' | 'stable';
  color: string;
  delay: number;
}> = ({ icon, label, value, trend, color, delay }) => (
  <motion.div
    className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-2xl border-2 border-white/10 relative overflow-hidden`}
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay, type: "spring", stiffness: 200 }}
    whileHover={{ scale: 1.05, y: -5 }}
  >
    {/* Efecto de brillo */}
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      animate={{ x: [-200, 200] }}
      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
    />

    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-white/20 rounded-xl">
          {icon}
        </div>
        <motion.div
          animate={{ 
            scale: trend === 'up' ? [1, 1.2, 1] : trend === 'down' ? [1, 0.8, 1] : [1, 1, 1],
            rotate: trend === 'up' ? [0, -10, 10, 0] : [0, 0, 0]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <TrendingUp className={`w-6 h-6 ${
            trend === 'up' ? 'text-green-200' : 
            trend === 'down' ? 'text-red-200 transform rotate-180' : 
            'text-yellow-200'
          }`} />
        </motion.div>
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  </motion.div>
);

// ============================================
// COMPONENTE: BADGE DE EFECTO
// ============================================
const EffectBadge: React.FC<{
  icon: string;
  label: string;
  color: string;
}> = ({ icon, label, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500 border-blue-400',
    gray: 'from-gray-500 to-slate-500 border-gray-400',
    orange: 'from-orange-500 to-red-500 border-orange-400',
    purple: 'from-purple-500 to-pink-500 border-purple-400'
  };

  return (
    <motion.span
      className={`px-4 py-2 bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} text-white text-sm font-semibold rounded-full border-2 shadow-lg`}
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {icon} {label}
    </motion.span>
  );
};

// ============================================
// COMPONENTE: BOTÓN DE ACCIÓN
// ============================================
const ActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  color: string;
  delay: number;
}> = ({ icon, label, onClick, disabled, color, delay }) => (
  <motion.button
    onClick={onClick}
    disabled={disabled}
    className={`flex-1 flex items-center justify-center px-8 py-4 rounded-2xl font-bold text-white transition-all duration-300 shadow-2xl ${
      disabled 
        ? 'bg-gray-600 cursor-not-allowed opacity-50' 
        : `bg-gradient-to-r ${color} hover:shadow-3xl`
    }`}
    initial={{ y: 50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay, type: "spring" }}
    whileHover={disabled ? {} : { scale: 1.05, y: -2 }}
    whileTap={disabled ? {} : { scale: 0.95 }}
  >
    {icon}
    <span className="ml-3">{label}</span>
  </motion.button>
);

export default InformeSimulacion;