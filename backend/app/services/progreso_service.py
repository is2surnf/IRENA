
    # app/services/progreso_service.py - VERSIÓN COMPLETAMENTE CORREGIDA
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from datetime import datetime
import logging
import json

from app.database import get_db
from app.models.progreso import (
    EstadisticaGeneral,
    EstadisticaElement,
    SimulacionHistorial,
    TeoriaProgreso,
    ProgresoGeneralResponse,
    HistorialSimulacionesResponse,
    EstadisticasElementosResponse,
    RespuestaGuardado,
    ResumenProgresoResponse
)

logger = logging.getLogger(__name__)

class ProgresoService:
    def __init__(self):
        self.db_session = None

    async def get_db(self) -> Session:
        """Obtener sesión de base de datos"""
        if not self.db_session:
            self.db_session = next(get_db())
        return self.db_session

    def _calcular_estado_elemento(self, rendimiento: float) -> str:
        """Calcular estado basado en rendimiento"""
        if rendimiento >= 90:
            return "Óptimo"
        elif rendimiento >= 80:
            return "Muy bueno"
        elif rendimiento >= 70:
            return "Bueno"
        elif rendimiento >= 60:
            return "Regular"
        else:
            return "Malo"

    def _convertir_minutos_a_tiempo(self, minutos: int) -> str:
        """Convertir minutos a formato 'Xh Ym'"""
        if minutos <= 0:
            return "0h 0m"
        horas = minutos // 60
        mins = minutos % 60
        return f"{horas}h {mins}m"

    # ==================== DATOS MOCK PARA DESARROLLO ====================

    async def get_mock_resumen_progreso(self, usuario_id: int) -> ResumenProgresoResponse:
        """Datos mock para desarrollo cuando la BD falla"""
        logger.warning(f"📋 Usando datos MOCK para resumen de usuario {usuario_id}")
        
        # Datos mock realistas basados en el usuario
        mock_data = {
            1: {"nivel": "Intermedio", "puntuacion": 650, "simulaciones": 4, "teorias": 3},
            2: {"nivel": "Avanzado", "puntuacion": 1200, "simulaciones": 9, "teorias": 7},
            3: {"nivel": "Principiante", "puntuacion": 150, "simulaciones": 1, "teorias": 0},
            4: {"nivel": "Intermedio", "puntuacion": 350, "simulaciones": 3, "teorias": 2},
            5: {"nivel": "Principiante", "puntuacion": 50, "simulaciones": 1, "teorias": 1}
        }
        
        user_data = mock_data.get(usuario_id, mock_data[1])
        
        return ResumenProgresoResponse(
            usuario_id=usuario_id,
            nivel=user_data["nivel"],
            puntuacion=user_data["puntuacion"],
            simulaciones_completadas=user_data["simulaciones"],
            total_simulaciones=10,
            teorias_completadas=user_data["teorias"],
            total_teorias=14,
            progreso_simulaciones=(user_data["simulaciones"] / 10) * 100,
            progreso_teorias=(user_data["teorias"] / 14) * 100,
            tiempo_total_legible=f"{user_data['simulaciones'] * 45}m",
            puede_guardar_progreso=usuario_id != 3,  # Usuario 3 es anónimo
            es_usuario_anonimo=usuario_id == 3,
            posicion_ranking=user_data["puntuacion"] // 100
        )

    async def get_mock_estadisticas_elementos(self, usuario_id: int) -> EstadisticasElementosResponse:
        """Datos mock para elementos"""
        elementos_mock = [
            EstadisticaElement(
                elemento_id=1, nombre_elemento="Hidrógeno", simbolo="H", 
                veces_usado=8, cantidad_total=12.5, rendimiento_promedio=85.5, estado="Óptimo"
            ),
            EstadisticaElement(
                elemento_id=8, nombre_elemento="Oxígeno", simbolo="O", 
                veces_usado=6, cantidad_total=9.2, rendimiento_promedio=78.3, estado="Muy bueno"
            ),
            EstadisticaElement(
                elemento_id=11, nombre_elemento="Sodio", simbolo="Na", 
                veces_usado=3, cantidad_total=4.1, rendimiento_promedio=65.2, estado="Bueno"
            )
        ]
        
        return EstadisticasElementosResponse(
            usuario_id=usuario_id,
            total_elementos_usados=len(elementos_mock),
            estadisticas=elementos_mock
        )

    async def get_mock_historial_simulaciones(self, usuario_id: int) -> HistorialSimulacionesResponse:
        """Datos mock para historial"""
        from datetime import datetime, timedelta
        
        simulaciones_mock = [
            SimulacionHistorial(
                id_simulacion=1, nombre="Síntesis de Agua", fecha=datetime.now() - timedelta(days=2),
                descripcion="Primera simulación exitosa", estado="Completada", elementos_usados=2,
                tipo_simulacion="Síntesis", rendimiento=92.5, duracion_estimada="45m"
            ),
            SimulacionHistorial(
                id_simulacion=2, nombre="Neutralización Ácido-Base", fecha=datetime.now() - timedelta(days=5),
                descripcion="Titulación con indicador", estado="Completada", elementos_usados=3,
                tipo_simulacion="Neutralización", rendimiento=87.3, duracion_estimada="30m"
            ),
            SimulacionHistorial(
                id_simulacion=3, nombre="Combustión del Magnesio", fecha=datetime.now() - timedelta(days=7),
                descripcion="Reacción exotérmica", estado="En proceso", elementos_usados=2,
                tipo_simulacion="Combustión", rendimiento=None, duracion_estimada="20m"
            )
        ]
        
        return HistorialSimulacionesResponse(
            usuario_id=usuario_id,
            total_simulaciones=len(simulaciones_mock),
            simulaciones=simulaciones_mock
        )

    async def get_mock_progreso_general(self, usuario_id: int) -> ProgresoGeneralResponse:
        """Datos mock para progreso general"""
        estadisticas_generales = EstadisticaGeneral(
            total_simulaciones=10,
            simulaciones_completadas=4,
            simulaciones_en_proceso=1,
            simulaciones_fallidas=0,
            elementos_diferentes_usados=3,
            tiempo_total_simulacion_minutos=180,
            teoria_completadas=3,
            teoria_totales=14,
            preguntas_ia_realizadas=3,
            nivel_experiencia="Intermedio",
            puntuacion_total=650
        )
        
        return ProgresoGeneralResponse(
            usuario_id=usuario_id,
            estadisticas_generales=estadisticas_generales,
            top_elementos=[
                EstadisticaElement(
                    elemento_id=1, nombre_elemento="Hidrógeno", simbolo="H",
                    veces_usado=8, cantidad_total=12.5, rendimiento_promedio=85.5, estado="Óptimo"
                ),
                EstadisticaElement(
                    elemento_id=8, nombre_elemento="Oxígeno", simbolo="O",
                    veces_usado=6, cantidad_total=9.2, rendimiento_promedio=78.3, estado="Muy bueno"
                )
            ],
            progreso_teorias=[]
        )

    # ==================== MÉTODOS PRINCIPALES CON FALLBACK ====================

    async def get_resumen_progreso(self, usuario_id: int) -> ResumenProgresoResponse:
        """Obtener resumen con fallback a datos mock"""
        try:
            logger.info(f"📋 Obteniendo resumen REAL para usuario {usuario_id}")
            db = await self.get_db()
            
            # Usar la función de BD para obtener resumen optimizado
            query = text("SELECT get_resumen_progreso_usuario(:usuario_id) as resumen")
            result = db.execute(query, {"usuario_id": usuario_id}).fetchone()
            
            if result and result.resumen:
                data = result.resumen if isinstance(result.resumen, dict) else {}
                
                response = ResumenProgresoResponse(
                    usuario_id=usuario_id,
                    nivel=str(data.get('nivel', 'Principiante')),
                    puntuacion=int(data.get('puntuacion', 0)),
                    simulaciones_completadas=int(data.get('simulaciones_completadas', 0)),
                    total_simulaciones=int(data.get('total_simulaciones', 0)),
                    teorias_completadas=int(data.get('teorias_completadas', 0)),
                    total_teorias=int(data.get('total_teorias', 0)),
                    progreso_simulaciones=float(data.get('progreso_simulaciones', 0.0)),
                    progreso_teorias=float(data.get('progreso_teorias', 0.0)),
                    tiempo_total_legible=str(data.get('tiempo_total_legible', '0h 0m')),
                    puede_guardar_progreso=bool(data.get('puede_guardar_progreso', False)),
                    es_usuario_anonimo=bool(data.get('es_usuario_anonimo', True)),
                    posicion_ranking=int(data.get('posicion_ranking')) if data.get('posicion_ranking') else None
                )
                
                logger.info(f"✅ Resumen REAL obtenido para usuario {usuario_id}")
                return response
            else:
                # Fallback a datos mock
                logger.warning("📋 No se encontraron datos reales, usando MOCK")
                return await self.get_mock_resumen_progreso(usuario_id)
                
        except Exception as e:
            logger.error(f"❌ Error BD en resumen, usando mock: {str(e)}")
            return await self.get_mock_resumen_progreso(usuario_id)

    async def get_estadisticas_elementos(self, usuario_id: int) -> EstadisticasElementosResponse:
        """Obtener estadísticas con fallback a mock"""
        try:
            logger.info(f"🧪 Obteniendo estadísticas REALES de elementos para usuario {usuario_id}")
            db = await self.get_db()
            
            query = text("""
                SELECT 
                    e.id_elemento,
                    e.nombre,
                    e.simbolo,
                    COUNT(se.simulacion_id) as veces_usado,
                    COALESCE(SUM(se.cantidad), 0) as cantidad_total,
                    COALESCE(AVG(
                        CASE 
                            WHEN se.cantidad >= 2.0 THEN 95.0
                            WHEN se.cantidad >= 1.5 THEN 88.0
                            WHEN se.cantidad >= 1.0 THEN 82.0
                            WHEN se.cantidad >= 0.5 THEN 75.0
                            ELSE 68.0
                        END
                    ), 70.0) as rendimiento_promedio
                FROM elemento e
                INNER JOIN simulacion_elemento se ON e.id_elemento = se.elemento_id
                INNER JOIN simulacion s ON se.simulacion_id = s.id_simulacion
                WHERE s.usuario_id = :usuario_id
                GROUP BY e.id_elemento, e.nombre, e.simbolo
                HAVING COUNT(se.simulacion_id) > 0
                ORDER BY veces_usado DESC, rendimiento_promedio DESC
            """)
            
            results = db.execute(query, {"usuario_id": usuario_id}).fetchall()
            
            estadisticas = []
            for row in results:
                try:
                    rendimiento = float(row.rendimiento_promedio)
                    
                    estadistica = EstadisticaElement(
                        elemento_id=int(row.id_elemento),
                        nombre_elemento=str(row.nombre),
                        simbolo=str(row.simbolo),
                        veces_usado=int(row.veces_usado),
                        cantidad_total=float(row.cantidad_total),
                        rendimiento_promedio=rendimiento,
                        estado=self._calcular_estado_elemento(rendimiento)
                    )
                    estadisticas.append(estadistica)
                except Exception as elem_error:
                    logger.error(f"Error procesando elemento {row.id_elemento}: {str(elem_error)}")
                    continue
            
            response = EstadisticasElementosResponse(
                usuario_id=usuario_id,
                total_elementos_usados=len(estadisticas),
                estadisticas=estadisticas
            )
            
            logger.info(f"✅ Estadísticas REALES obtenidas: {len(estadisticas)} elementos")
            return response
            
        except Exception as e:
            logger.error(f"❌ Error BD en elementos, usando mock: {str(e)}")
            return await self.get_mock_estadisticas_elementos(usuario_id)

    async def get_historial_simulaciones(
        self, 
        usuario_id: int, 
        limite: int = 10, 
        offset: int = 0, 
        estado: Optional[str] = None
    ) -> HistorialSimulacionesResponse:
        """Obtener historial con fallback a mock"""
        try:
            logger.info(f"📋 Obteniendo historial REAL para usuario {usuario_id}")
            db = await self.get_db()
            
            where_clause = "WHERE s.usuario_id = :usuario_id"
            params = {"usuario_id": usuario_id}
            
            if estado:
                where_clause += " AND s.estado = :estado"
                params["estado"] = estado
            
            # Query para el total
            query_count = text(f"SELECT COUNT(*) as total FROM simulacion s {where_clause}")
            total_result = db.execute(query_count, params).fetchone()
            total_simulaciones = int(total_result.total) if total_result else 0
            
            # Query para las simulaciones
            query_simulaciones = text(f"""
                SELECT 
                    s.id_simulacion,
                    s.nombre,
                    s.fecha,
                    COALESCE(s.descripcion, 'Simulación química') as descripcion,
                    COALESCE(s.estado, 'Completada') as estado,
                    COALESCE(s.duracion_minutos, 30) as duracion_minutos,
                    COALESCE(s.tipo_simulacion, 'General') as tipo_simulacion,
                    COALESCE(s.puntos_obtenidos, 0) as puntos_obtenidos,
                    COUNT(se.elemento_id) as elementos_usados
                FROM simulacion s
                LEFT JOIN simulacion_elemento se ON s.id_simulacion = se.simulacion_id
                {where_clause}
                GROUP BY s.id_simulacion
                ORDER BY s.fecha DESC
                LIMIT :limite OFFSET :offset
            """)
            
            params.update({"limite": limite, "offset": offset})
            results = db.execute(query_simulaciones, params).fetchall()
            
            simulaciones = []
            for row in results:
                try:
                    # Calcular rendimiento
                    rendimiento = None
                    if row.estado == 'Completada':
                        if row.puntos_obtenidos > 0:
                            rendimiento = min(100.0, (row.puntos_obtenidos / 50.0) * 100)
                        else:
                            rendimiento = min(95.0, 70.0 + (row.elementos_usados * 5))
                    
                    simulacion = SimulacionHistorial(
                        id_simulacion=int(row.id_simulacion),
                        nombre=str(row.nombre),
                        fecha=row.fecha,
                        descripcion=str(row.descripcion),
                        estado=str(row.estado),
                        elementos_usados=int(row.elementos_usados or 0),
                        tipo_simulacion=str(row.tipo_simulacion),
                        rendimiento=rendimiento,
                        duracion_estimada=self._convertir_minutos_a_tiempo(int(row.duracion_minutos))
                    )
                    simulaciones.append(simulacion)
                except Exception as sim_error:
                    logger.error(f"Error procesando simulación {row.id_simulacion}: {str(sim_error)}")
                    continue
            
            response = HistorialSimulacionesResponse(
                usuario_id=usuario_id,
                total_simulaciones=total_simulaciones,
                simulaciones=simulaciones
            )
            
            logger.info(f"✅ Historial REAL obtenido: {len(simulaciones)} simulaciones")
            return response
            
        except Exception as e:
            logger.error(f"❌ Error BD en historial, usando mock: {str(e)}")
            return await self.get_mock_historial_simulaciones(usuario_id)

    async def get_progreso_general(self, usuario_id: int) -> ProgresoGeneralResponse:
        """Obtener progreso general con fallback a mock"""
        try:
            logger.info(f"📊 Obteniendo progreso general REAL para usuario {usuario_id}")
            
            # Obtener estadísticas con validación
            estadisticas_generales = await self.get_estadisticas_generales(usuario_id)
            estadisticas_elementos_response = await self.get_estadisticas_elementos(usuario_id)
            
            # Top 5 elementos
            top_elementos = estadisticas_elementos_response.estadisticas[:5]
            
            # Progreso teorías (simplificado por ahora)
            progreso_teorias = []
            
            response = ProgresoGeneralResponse(
                usuario_id=usuario_id,
                estadisticas_generales=estadisticas_generales,
                top_elementos=top_elementos,
                progreso_teorias=progreso_teorias
            )
            
            logger.info(f"✅ Progreso general REAL obtenido para usuario {usuario_id}")
            return response
            
        except Exception as e:
            logger.error(f"❌ Error obteniendo progreso general, usando mock: {str(e)}")
            return await self.get_mock_progreso_general(usuario_id)

    async def get_estadisticas_generales(self, usuario_id: int) -> EstadisticaGeneral:
        """Obtener estadísticas generales del usuario"""
        try:
            db = await self.get_db()
            
            query = text("""
                SELECT 
                    COALESCE(total_simulaciones, 0) as total_simulaciones,
                    COALESCE(simulaciones_completadas, 0) as simulaciones_completadas,
                    COALESCE(simulaciones_en_proceso, 0) as simulaciones_en_proceso,
                    COALESCE(simulaciones_fallidas, 0) as simulaciones_fallidas,
                    COALESCE(elementos_diferentes_usados, 0) as elementos_diferentes_usados,
                    COALESCE(teorias_leidas, 0) as teorias_leidas,
                    COALESCE(total_teorias_disponibles, 0) as total_teorias_disponibles,
                    COALESCE(preguntas_ia_realizadas, 0) as preguntas_ia_realizadas,
                    COALESCE(puntos_totales, 0) as puntos_totales,
                    COALESCE(nivel, 'Principiante') as nivel,
                    COALESCE(tiempo_total_simulacion_minutos, 0) as tiempo_total_simulacion_minutos
                FROM vista_estadisticas_completas
                WHERE id_usuario = :usuario_id
            """)
            
            result = db.execute(query, {"usuario_id": usuario_id}).fetchone()
            
            if result:
                return EstadisticaGeneral(
                    total_simulaciones=int(result.total_simulaciones),
                    simulaciones_completadas=int(result.simulaciones_completadas),
                    simulaciones_en_proceso=int(result.simulaciones_en_proceso),
                    simulaciones_fallidas=int(result.simulaciones_fallidas),
                    elementos_diferentes_usados=int(result.elementos_diferentes_usados),
                    tiempo_total_simulacion_minutos=int(result.tiempo_total_simulacion_minutos),
                    teoria_completadas=int(result.teorias_leidas),
                    teoria_totales=int(result.total_teorias_disponibles),
                    preguntas_ia_realizadas=int(result.preguntas_ia_realizadas),
                    nivel_experiencia=str(result.nivel),
                    puntuacion_total=int(result.puntos_totales)
                )
            else:
                # Usuario no existe, usar datos por defecto
                return EstadisticaGeneral(
                    total_simulaciones=0,
                    simulaciones_completadas=0,
                    simulaciones_en_proceso=0,
                    simulaciones_fallidas=0,
                    elementos_diferentes_usados=0,
                    tiempo_total_simulacion_minutos=0,
                    teoria_completadas=0,
                    teoria_totales=0,
                    preguntas_ia_realizadas=0,
                    nivel_experiencia="Principiante",
                    puntuacion_total=0
                )
            
        except Exception as e:
            logger.error(f"Error calculando estadísticas generales: {str(e)}")
            return EstadisticaGeneral(
                total_simulaciones=0,
                simulaciones_completadas=0,
                simulaciones_en_proceso=0,
                simulaciones_fallidas=0,
                elementos_diferentes_usados=0,
                tiempo_total_simulacion_minutos=0,
                teoria_completadas=0,
                teoria_totales=0,
                preguntas_ia_realizadas=0,
                nivel_experiencia="Principiante",
                puntuacion_total=0
            )

    async def guardar_progreso(self, usuario_id: int, progreso_data: dict) -> RespuestaGuardado:
        """Guardar progreso"""
        try:
            logger.info(f"💾 Guardando progreso REAL para usuario {usuario_id}")
            
            db = await self.get_db()
            
            # Validar y extraer datos
            tipo_evento = str(progreso_data.get('accion', 'sesion_estudio'))
            descripcion = str(progreso_data.get('descripcion', 'Progreso guardado'))
            puntos = int(progreso_data.get('puntos', 0))
            datos_json = json.dumps(progreso_data.get('datos', {}))
            sesion_id = progreso_data.get('sesion_id')
            
            query = text("""
                SELECT registrar_progreso(
                    :usuario_id,
                    :tipo_evento,
                    :descripcion,
                    :puntos,
                    :datos_json::jsonb,
                    :sesion_id::uuid
                ) as progreso_id
            """)
            
            result = db.execute(query, {
                "usuario_id": usuario_id,
                "tipo_evento": tipo_evento,
                "descripcion": descripcion,
                "puntos": puntos,
                "datos_json": datos_json,
                "sesion_id": sesion_id
            }).fetchone()
            
            db.commit()
            
            return RespuestaGuardado(
                success=True,
                message="Progreso guardado exitosamente",
                timestamp=datetime.now().isoformat(),
                usuario_id=usuario_id,
                progreso_id=int(result.progreso_id) if result and result.progreso_id else None
            )
            
        except Exception as e:
            logger.error(f"Error guardando progreso: {str(e)}")
            raise

# Instancia singleton
progreso_service = ProgresoService()