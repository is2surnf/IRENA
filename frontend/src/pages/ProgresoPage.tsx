// pages/ProgresoPage.tsx - VERSIÓN COMPLETAMENTE CORREGIDA
import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, Calendar, Award, Target, BarChart3, Activity, 
  CheckCircle, Clock, PlayCircle, Save, AlertCircle, RefreshCw, 
  User, UserX 
} from 'lucide-react';
import { useProgreso } from '../hooks/useProgreso';
import { formatearTiempo, obtenerColorEstado } from '../services/progreso.service';

const ProgresoPage = () => {
  const [usuarioId, setUsuarioId] = useState<number>(1);
  const [tipoUsuario, setTipoUsuario] = useState<'registrado' | 'anonimo'>('registrado');
  const [mostrarBotonGuardar, setMostrarBotonGuardar] = useState<boolean>(false);
  
  const {
    progresoGeneral,
    historialSimulaciones,
    estadisticasElementos,
    resumenProgreso,
    loading,
    errors,
    isLoading,
    hasError,
    puedeGuardarProgreso,
    cargarEstadisticasElementos,
    guardarProgreso,
    recargarTodo,
    clearErrors
  } = useProgreso(usuarioId);

  // Cargar datos iniciales
  useEffect(() => {
    if (usuarioId) {
      cargarEstadisticasElementos();
    }
  }, [usuarioId, cargarEstadisticasElementos]);

  // Función para obtener ícono del estado
  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Completada': return <CheckCircle className="w-4 h-4" />;
      case 'En proceso': return <Clock className="w-4 h-4" />;
      case 'Fallida': return <PlayCircle className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  // Función para cambiar usuario
  const cambiarUsuario = (nuevoId: number, nuevoTipo: 'registrado' | 'anonimo') => {
    setUsuarioId(nuevoId);
    setTipoUsuario(nuevoTipo);
    clearErrors();
  };

  // Función para guardar progreso
  const handleGuardarProgreso = async () => {
    if (!puedeGuardarProgreso || tipoUsuario === 'anonimo') {
      alert('Error: Usuario no autenticado. Para guardar progreso debe iniciar sesión.');
      return;
    }

    try {
      const progresoData = {
        fecha: new Date().toISOString(),
        accion: 'guardar_progreso_manual',
        descripcion: 'Progreso guardado manualmente desde el dashboard',
        puntos: 5,
        datos: {
          resumen: resumenProgreso
        }
      };

      await guardarProgreso(progresoData);
      alert('✅ Progreso guardado exitosamente');
      setMostrarBotonGuardar(false);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'Error desconocido';
      alert(`❌ Error guardando progreso: ${mensaje}`);
    }
  };

  // Calcular progreso
  const progresoSimulaciones = useMemo(() => {
    return resumenProgreso?.progreso_simulaciones ?? 0;
  }, [resumenProgreso]);

  const progresoTeorias = useMemo(() => {
    return resumenProgreso?.progreso_teorias ?? 0;
  }, [resumenProgreso]);

  // Obtener tiempo total formateado
  const tiempoTotalFormateado = useMemo(() => {
    if (progresoGeneral?.estadisticas_generales?.tiempo_total_simulacion_minutos) {
      return formatearTiempo(progresoGeneral.estadisticas_generales.tiempo_total_simulacion_minutos);
    }
    return resumenProgreso?.tiempo_total_legible ?? '0h 0m';
  }, [progresoGeneral, resumenProgreso]);

  // Elementos para mostrar - CORREGIDO CON VALIDACIÓN
  const elementosParaMostrar = useMemo(() => {
    if (!estadisticasElementos?.estadisticas || !Array.isArray(estadisticasElementos.estadisticas)) {
      return [];
    }
    return estadisticasElementos.estadisticas.slice(0, 3).map(elem => ({
      simbolo: elem.simbolo || 'N/A',
      rendimiento_promedio: elem.rendimiento_promedio || 0,
      estado: elem.estado || 'Desconocido'
    }));
  }, [estadisticasElementos]);

  // Simulaciones para mostrar - CORREGIDO CON VALIDACIÓN
  const simulacionesParaMostrar = useMemo(() => {
    if (!historialSimulaciones?.simulaciones || !Array.isArray(historialSimulaciones.simulaciones)) {
      return [];
    }
    return historialSimulaciones.simulaciones.slice(0, 3);
  }, [historialSimulaciones]);

  // Datos semanales
  const datosSemana = useMemo(() => {
    const base = resumenProgreso?.simulaciones_completadas ?? 0;
    return ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((dia) => {
      const altura = Math.min(Math.max(base * 10 + Math.random() * 40, 20), 100);
      return { dia, altura };
    });
  }, [resumenProgreso?.simulaciones_completadas]);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header con controles */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold">Reporte Químico</h1>
            <div className="w-16 h-1 bg-cyan-400 mt-2"></div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Selector de usuario */}
            <div className="flex items-center gap-2 bg-gray-800 rounded-lg p-2">
              {tipoUsuario === 'registrado' ? 
                <User className="w-4 h-4 text-green-400" /> : 
                <UserX className="w-4 h-4 text-red-400" />
              }
              <select 
                value={`${usuarioId}-${tipoUsuario}`}
                onChange={(e) => {
                  const [id, tipo] = e.target.value.split('-');
                  cambiarUsuario(parseInt(id), tipo as 'registrado' | 'anonimo');
                }}
                className="bg-transparent text-white text-sm"
              >
                <option value="1-registrado">Usuario 1 (Registrado)</option>
                <option value="2-registrado">Usuario 2 (Registrado)</option>
                <option value="3-anonimo">Usuario Anónimo</option>
                <option value="4-registrado">Usuario 4 (Registrado)</option>
              </select>
            </div>

            {/* Botón recargar */}
            <button
              onClick={recargarTodo}
              disabled={isLoading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Recargar
            </button>

            {/* Botón guardar progreso */}
            {(mostrarBotonGuardar || tipoUsuario === 'registrado') && (
              <button
                onClick={handleGuardarProgreso}
                disabled={loading.guardando || tipoUsuario === 'anonimo'}
                title={tipoUsuario === 'anonimo' ? 'Debe iniciar sesión para guardar progreso' : 'Guardar progreso actual'}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  tipoUsuario === 'anonimo' 
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700 disabled:bg-green-800'
                }`}
              >
                <Save className={`w-4 h-4 ${loading.guardando ? 'animate-pulse' : ''}`} />
                {loading.guardando ? 'Guardando...' : 'Guardar Progreso'}
              </button>
            )}

            <button
              onClick={() => setMostrarBotonGuardar(!mostrarBotonGuardar)}
              className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
            >
              {mostrarBotonGuardar ? 'Ocultar' : 'Mostrar'} Guardar
            </button>
          </div>
        </div>

        {/* Alertas */}
        {hasError && (
          <div className="bg-red-800 border border-red-600 rounded-lg p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm">Hay errores cargando algunos datos. Intente recargar.</span>
            <button onClick={clearErrors} className="ml-auto text-red-400 hover:text-red-300">
              Cerrar
            </button>
          </div>
        )}

        {tipoUsuario === 'anonimo' && (
          <div className="bg-yellow-800 border border-yellow-600 rounded-lg p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-400" />
            <span className="text-sm">Usuario anónimo: El progreso no se puede guardar. Inicie sesión para guardar su progreso.</span>
          </div>
        )}
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Simulaciones */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 relative">
          {loading.resumen && (
            <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            <span className="text-2xl font-bold text-cyan-400">
              {resumenProgreso?.simulaciones_completadas ?? 0}/{resumenProgreso?.total_simulaciones ?? 0}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Simulaciones</h3>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-cyan-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progresoSimulaciones}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400">{progresoSimulaciones.toFixed(1)}% completado</p>
        </div>

        {/* Teoría */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 relative">
          {loading.resumen && (
            <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <Target className="w-8 h-8 text-green-400" />
            <span className="text-2xl font-bold text-green-400">
              {resumenProgreso?.teorias_completadas ?? 0}/{resumenProgreso?.total_teorias ?? 0}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Teoría</h3>
          <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
            <div 
              className="bg-green-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progresoTeorias}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-400">{progresoTeorias.toFixed(1)}% completado</p>
        </div>

        {/* Tiempo total */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 relative">
          {loading.resumen && (
            <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <Clock className="w-8 h-8 text-purple-400" />
            <span className="text-2xl font-bold text-purple-400">
              {tiempoTotalFormateado}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Tiempo de Estudio</h3>
          <p className="text-sm text-gray-400">Total acumulado</p>
        </div>

        {/* Nivel y puntos */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 relative">
          {loading.resumen && (
            <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
            </div>
          )}
          <div className="flex items-center justify-between mb-3">
            <Award className="w-8 h-8 text-yellow-400" />
            <span className="text-2xl font-bold text-yellow-400">
              {resumenProgreso?.nivel ?? 'Principiante'}
            </span>
          </div>
          <h3 className="text-lg font-semibold mb-2">Progreso</h3>
          <p className="text-sm text-gray-400">{resumenProgreso?.puntuacion ?? 0} puntos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Resultados - Elementos */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 relative">
          {loading.elementos && (
            <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
          )}
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-cyan-400" />
            Resultados
          </h2>
          
          <div className="overflow-hidden rounded-lg">
            <table className="w-full">
              <thead className="bg-indigo-600">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Elemento</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Rendimiento</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-gray-750">
                {elementosParaMostrar.length > 0 ? (
                  elementosParaMostrar.map((elemento, index) => (
                    <tr key={index} className="border-b border-gray-600 hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-3 font-medium">{elemento.simbolo}</td>
                      <td className="px-4 py-3">{elemento.rendimiento_promedio.toFixed(1)}%</td>
                      <td className={`px-4 py-3 font-medium ${obtenerColorEstado(elemento.estado)}`}>
                        {elemento.estado}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-center text-gray-400">
                      No hay datos de elementos disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {errors.elementos && (
            <div className="mt-4 p-3 bg-red-800 border border-red-600 rounded text-sm">
              Error: {errors.elementos}
            </div>
          )}
        </div>

        {/* Historial de simulaciones */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 relative">
          {loading.historial && (
            <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
            </div>
          )}
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <Calendar className="w-6 h-6 mr-2 text-cyan-400" />
            Historial de simulaciones
          </h2>
          
          <div className="space-y-4">
            {simulacionesParaMostrar.length > 0 ? (
              simulacionesParaMostrar.map((sim) => (
                <div key={sim.id_simulacion} className="bg-gray-750 rounded-lg p-4 border border-gray-600 hover:border-cyan-400 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{sim.nombre}</h3>
                    <div className={`flex items-center ${obtenerColorEstado(sim.estado)}`}>
                      {getEstadoIcon(sim.estado)}
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      <strong>Fecha:</strong> {new Date(sim.fecha).toLocaleDateString('es-ES')}
                    </span>
                    <span className={`font-medium ${obtenerColorEstado(sim.estado)}`}>
                      <strong>Estado:</strong> {sim.estado}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                      {sim.tipo_simulacion}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">
                No hay simulaciones disponibles
              </div>
            )}
          </div>

          {errors.historial && (
            <div className="mt-4 p-3 bg-red-800 border border-red-600 rounded text-sm">
              Error: {errors.historial}
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de progreso semanal */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <Activity className="w-6 h-6 mr-2 text-cyan-400" />
          Actividad Semanal
        </h2>
        
        <div className="flex items-end justify-between h-32 bg-gray-750 rounded-lg p-4">
          {datosSemana.map(({ dia, altura }) => (
            <div key={dia} className="flex flex-col items-center">
              <div 
                className="w-8 bg-cyan-400 rounded-t mb-2 transition-all duration-500"
                style={{ height: `${altura}px` }}
              ></div>
              <span className="text-xs text-gray-400">{dia}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="flex justify-between items-center text-sm text-gray-400">
          <div>
            Usuario {usuarioId} ({tipoUsuario}) | Datos actualizados: {new Date().toLocaleString('es-ES')}
          </div>
          <div className="flex items-center gap-4">
            <span>Total elementos: {estadisticasElementos?.total_elementos_usados ?? 0}</span>
            <span>Total simulaciones: {historialSimulaciones?.total_simulaciones ?? 0}</span>
            {puedeGuardarProgreso && tipoUsuario === 'registrado' && (
              <span className="text-green-400">Puede guardar progreso</span>
            )}
            {tipoUsuario === 'anonimo' && (
              <span className="text-red-400">No puede guardar progreso</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgresoPage;