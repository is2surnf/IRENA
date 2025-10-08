# app/models/progreso.py - VERSIÓN CORREGIDA
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
import uuid

# EXPORT PARA FACILITAR IMPORTS
# =====================================

__all__ = [
    # Modelos base
    "EstadisticaElement",
    "SimulacionHistorial", 
    "TeoriaProgreso",
    "EstadisticaGeneral",
    
    # Modelos avanzados
    "LogroUsuario",
    "SesionEstudio",
    "RankingUsuario",
    "MetricaTiempo",
    "ResumenSemanal",
    
    # Responses principales
    "ProgresoGeneralResponse",
    "HistorialSimulacionesResponse",
    "EstadisticasElementosResponse",
    "LogrosUsuarioResponse",
    "DashboardProgresoResponse",
    "AnalisisRendimientoResponse",
    
    # Nuevo response de resumen
    "ResumenProgresoResponse",
    
    # Requests
    "FiltroHistorialRequest",
    "MetricasRequest",
    "GuardarProgresoRequest",
    "IniciarSesionRequest",
    
    # Responses específicas
    "RespuestaGuardado",
    "EstadisticasRapidas",
    "HealthCheckResponse",
    
    # Errores
    "ErrorResponse",
    
    # Validaciones
    "ValidacionUsuario",
    
    # Configuración
    "ConfiguracionProgreso"
]
# MODELOS BASE CORREGIDOS
# =====================================

class EstadisticaElement(BaseModel):
    """Estadística de un elemento específico"""
    elemento_id: int
    nombre_elemento: str
    simbolo: str
    veces_usado: int
    cantidad_total: Decimal
    rendimiento_promedio: float
    estado: str = Field(description="Óptimo, Muy bueno, Bueno, Regular, Malo")

class SimulacionHistorial(BaseModel):
    """Historial de una simulación"""
    id_simulacion: int
    nombre: str
    fecha: datetime
    descripcion: Optional[str] = None
    estado: str = Field(description="Completada, En proceso, Fallida")
    elementos_usados: int
    tipo_simulacion: str
    rendimiento: Optional[float] = None
    duracion_estimada: Optional[str] = None

class TeoriaProgreso(BaseModel):
    """Progreso en teorías"""
    id_teoria: int
    titulo: str
    categoria: str
    leido: bool
    fecha_lectura: Optional[datetime] = None
    tareas_completadas: int
    tareas_totales: int
    porcentaje_completado: float

class EstadisticaGeneral(BaseModel):
    """Estadísticas generales del usuario - CORREGIDO"""
    total_simulaciones: int
    simulaciones_completadas: int
    simulaciones_en_proceso: int
    simulaciones_fallidas: int
    elementos_diferentes_usados: int
    tiempo_total_simulacion_minutos: int  # CORRECCIÓN: int en lugar de str
    teoria_completadas: int
    teoria_totales: int
    preguntas_ia_realizadas: int
    nivel_experiencia: str = Field(description="Principiante, Intermedio, Avanzado, Experto")
    puntuacion_total: int

    # Propiedad calculada para compatibilidad con frontend
    @property
    def tiempo_total_simulacion(self) -> str:
        """Convierte minutos a formato legible para el frontend"""
        if self.tiempo_total_simulacion_minutos <= 0:
            return "0h 0m"
        horas = self.tiempo_total_simulacion_minutos // 60
        minutos = self.tiempo_total_simulacion_minutos % 60
        return f"{horas}h {minutos}m"

# =====================================
# MODELOS PARA FUNCIONALIDADES AVANZADAS
# =====================================

class LogroUsuario(BaseModel):
    """Logro del usuario"""
    id_logro: int
    codigo_logro: str
    nombre: str
    descripcion: str
    icono: str
    puntos_requeridos: int
    obtenido: bool
    fecha_obtenido: Optional[datetime] = None

class SesionEstudio(BaseModel):
    """Sesión de estudio del usuario"""
    id_sesion: str
    usuario_id: int
    fecha_inicio: datetime
    fecha_fin: Optional[datetime] = None
    duracion_minutos: Optional[int] = None
    actividades_realizadas: int = 0
    puntos_sesion: int = 0
    tipo_actividad_principal: str
    dispositivo: str = "web"
    activa: bool = True

class RankingUsuario(BaseModel):
    """Ranking del usuario comparado con otros"""
    posicion: int
    total_usuarios: int
    porcentaje_superior: float
    puntuacion_usuario: int
    puntuacion_promedio: float

class MetricaTiempo(BaseModel):
    """Métrica temporal para gráficos"""
    fecha: datetime
    simulaciones: int
    teorias_completadas: int
    elementos_nuevos: int
    
class ResumenSemanal(BaseModel):
    """Resumen de actividad semanal"""
    semana_inicio: datetime
    simulaciones_realizadas: int
    teorias_leidas: int
    tiempo_dedicado: str
    nuevos_elementos: int
    progreso_general: float

# =====================================
# RESPONSES PRINCIPALES
# =====================================

class ProgresoGeneralResponse(BaseModel):
    """Response principal del progreso del usuario"""
    usuario_id: int
    estadisticas_generales: EstadisticaGeneral
    top_elementos: List[EstadisticaElement]
    progreso_teorias: List[TeoriaProgreso]
    
class HistorialSimulacionesResponse(BaseModel):
    """Response del historial de simulaciones"""
    usuario_id: int
    total_simulaciones: int
    simulaciones: List[SimulacionHistorial]
    
class EstadisticasElementosResponse(BaseModel):
    """Response detallado de estadísticas por elementos"""
    usuario_id: int
    total_elementos_usados: int
    estadisticas: List[EstadisticaElement]

class LogrosUsuarioResponse(BaseModel):
    """Response de logros del usuario"""
    usuario_id: int
    total_logros_disponibles: int
    logros_obtenidos: int
    logros: List[LogroUsuario]
    proximo_logro: Optional[LogroUsuario] = None

class DashboardProgresoResponse(BaseModel):
    """Response completo para el dashboard de progreso"""
    usuario_id: int
    resumen: EstadisticaGeneral
    elementos_destacados: List[EstadisticaElement]
    simulaciones_recientes: List[SimulacionHistorial]
    teorias_pendientes: List[TeoriaProgreso]
    ranking: Optional[RankingUsuario] = None
    metricas_temporales: List[MetricaTiempo]

class AnalisisRendimientoResponse(BaseModel):
    """Análisis detallado del rendimiento del usuario"""
    usuario_id: int
    rendimiento_general: float
    areas_fortaleza: List[str]
    areas_mejora: List[str]
    recomendaciones: List[str]
    comparacion_tiempo: List[MetricaTiempo]
    nivel_actual: str
    proximo_nivel: str
    progreso_nivel: float

# =====================================
# NUEVO: MODELO DE RESUMEN DE PROGRESO
# =====================================

class ResumenProgresoResponse(BaseModel):
    """Respuesta con resumen rápido de progreso para el frontend - NUEVO"""
    usuario_id: int
    nivel: str
    puntuacion: int
    simulaciones_completadas: int
    total_simulaciones: int
    teorias_completadas: int
    total_teorias: int
    progreso_simulaciones: float
    progreso_teorias: float
    tiempo_total_legible: str
    puede_guardar_progreso: bool
    es_usuario_anonimo: bool
    posicion_ranking: Optional[int] = None

# =====================================
# REQUESTS
# =====================================

class FiltroHistorialRequest(BaseModel):
    """Filtros para el historial de simulaciones"""
    limite: Optional[int] = Field(default=10, ge=1, le=100)
    offset: Optional[int] = Field(default=0, ge=0)
    estado: Optional[str] = None
    fecha_desde: Optional[datetime] = None
    fecha_hasta: Optional[datetime] = None
    tipo_simulacion: Optional[str] = None
    
class MetricasRequest(BaseModel):
    """Request para métricas específicas"""
    periodo: Optional[str] = Field(default="mes", description="dia, semana, mes, año")
    categoria_teoria: Optional[str] = None

class GuardarProgresoRequest(BaseModel):
    """Request para guardar progreso"""
    accion: str = Field(description="Tipo de evento: simulacion_completada, teoria_leida, etc.")
    descripcion: Optional[str] = None
    puntos: Optional[int] = 0
    datos: Optional[Dict[str, Any]] = {}
    sesion_id: Optional[str] = None

class IniciarSesionRequest(BaseModel):
    """Request para iniciar sesión de estudio"""
    tipo_actividad: str = Field(description="simulacion, teoria, mixto")
    dispositivo: Optional[str] = "web"

# =====================================
# RESPONSES ESPECÍFICAS
# =====================================

class RespuestaGuardado(BaseModel):
    """Respuesta del guardado de progreso"""
    success: bool
    message: str
    timestamp: str
    usuario_id: int
    progreso_id: Optional[int] = None

class EstadisticasRapidas(BaseModel):
    """Estadísticas rápidas para componentes ligeros"""
    puntos_totales: int
    nivel: str
    actividad_reciente: bool
    simulaciones_semana: int
    logros_obtenidos: int
    proximo_objetivo: str

class HealthCheckResponse(BaseModel):
    """Response del health check"""
    status: str
    service: str
    timestamp: str
    endpoints_available: List[str]
    version: Optional[str] = "1.0.0"

# =====================================
# MODELOS DE ERROR
# =====================================

class ErrorResponse(BaseModel):
    """Response estándar de error"""
    error: bool = True
    message: str
    code: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    timestamp: str
    usuario_id: Optional[int] = None

# =====================================
# VALIDACIONES Y HELPERS
# =====================================

class ValidacionUsuario(BaseModel):
    """Validación de usuario"""
    usuario_id: int = Field(ge=1, description="ID del usuario debe ser mayor a 0")
    es_registrado: bool = Field(default=False, description="Si el usuario está registrado")
    puede_guardar: bool = Field(default=False, description="Si puede guardar progreso")

# =====================================
# CONFIGURACIONES Y CONSTANTES
# =====================================

class ConfiguracionProgreso(BaseModel):
    """Configuración del sistema de progreso"""
    puntos_simulacion_completada: int = 50
    puntos_teoria_leida: int = 30
    puntos_pregunta_ia: int = 10
    puntos_ejercicio_completado: int = 25
    puntos_nivel_alcanzado: int = 100
    
    umbrales_nivel: Dict[str, int] = {
        "Principiante": 0,
        "Intermedio": 500,
        "Avanzado": 1000,
        "Experto": 2000
    }
    
    tiempo_sesion_maxima_horas: int = 8
    limite_consultas_por_dia: int = 100

# =====================================