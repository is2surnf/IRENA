# backend/app/api/endpoints/teoria.py (VERSIÓN CORREGIDA COMPLETA)
from fastapi import APIRouter, Depends, HTTPException, Query, Body
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.crud.teoria import *
from app.schemas.teoria import *
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/health/status")
async def health_check():
    """Health check para el servicio de teoría"""
    return {
        "status": "healthy",
        "service": "teoria",
        "message": "Servicio de teoría funcionando correctamente"
    }

def convert_teoria_to_schema(teoria_obj) -> Teoria:
    """Convertir modelo SQLAlchemy a schema Pydantic"""
    try:
        return Teoria(
            id=teoria_obj.id_teoria,  # Mapear correctamente
            titulo=teoria_obj.titulo,
            contenido=teoria_obj.contenido,
            categoria=teoria_obj.categoria,
            leido=False  # Default value
        )
    except Exception as e:
        logger.error(f"Error convirtiendo teoría: {e}")
        raise HTTPException(status_code=500, detail="Error procesando teoría")

@router.get("/", response_model=List[Teoria])
def get_teorias(
    skip: int = Query(0, ge=0, description="Número de registros a omitir"),
    limit: int = Query(100, ge=1, le=1000, description="Límite de registros"),
    categoria: Optional[str] = Query(None, description="Filtrar por categoría"),
    db: Session = Depends(get_db)
):
    """
    Obtener todas las teorías con filtros opcionales
    """
    try:
        teorias_db = get_teorias_db(db, skip=skip, limit=limit, categoria=categoria)
        
        # Convertir manualmente cada teoría
        teorias_response = []
        for teoria_obj in teorias_db:
            teoria_schema = convert_teoria_to_schema(teoria_obj)
            teorias_response.append(teoria_schema)
        
        logger.info(f"Obtenidas {len(teorias_response)} teorías")
        return teorias_response
        
    except Exception as e:
        logger.error(f"Error obteniendo teorías: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/buscar", response_model=List[Teoria])
def search_teorias(
    q: str = Query(..., min_length=1, description="Término de búsqueda"),
    categoria: Optional[str] = Query(None, description="Filtrar por categoría"),
    db: Session = Depends(get_db)
):
    """
    Buscar teorías por título o contenido
    """
    try:
        teorias_db = search_teorias_db(db, search_term=q, categoria=categoria)
        
        # Convertir manualmente cada teoría
        teorias_response = []
        for teoria_obj in teorias_db:
            teoria_schema = convert_teoria_to_schema(teoria_obj)
            teorias_response.append(teoria_schema)
        
        logger.info(f"Búsqueda '{q}': {len(teorias_response)} resultados")
        return teorias_response
        
    except Exception as e:
        logger.error(f"Error en búsqueda: {e}")
        raise HTTPException(status_code=500, detail="Error en la búsqueda")

@router.get("/categoria/{categoria_name}", response_model=List[Teoria])
def get_teorias_by_categoria(
    categoria_name: str,
    db: Session = Depends(get_db)
):
    """
    Obtener teorías de una categoría específica
    """
    try:
        teorias_db = get_teorias_by_categoria_db(db, categoria=categoria_name)
        
        # Convertir manualmente cada teoría
        teorias_response = []
        for teoria_obj in teorias_db:
            teoria_schema = convert_teoria_to_schema(teoria_obj)
            teorias_response.append(teoria_schema)
        
        logger.info(f"Obtenidas {len(teorias_response)} teorías para categoría '{categoria_name}'")
        return teorias_response
        
    except Exception as e:
        logger.error(f"Error obteniendo teorías por categoría: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/categorias", response_model=List[str])
def get_categorias(db: Session = Depends(get_db)):
    """
    Obtener todas las categorías disponibles
    """
    try:
        categorias = get_categorias_disponibles(db)
        return categorias
    except Exception as e:
        logger.error(f"Error obteniendo categorías: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/{teoria_id}", response_model=Teoria)
def get_teoria(
    teoria_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtener una teoría específica por ID
    """
    try:
        teoria_obj = get_teoria_db(db, teoria_id=teoria_id)
        if not teoria_obj:
            raise HTTPException(status_code=404, detail="Teoría no encontrada")
        
        # Convertir manualmente
        teoria_schema = convert_teoria_to_schema(teoria_obj)
        
        logger.info(f"Obtenida teoría ID: {teoria_id}")
        return teoria_schema
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo teoría {teoria_id}: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.post("/", response_model=Teoria)
def create_teoria(
    teoria: TeoriaCreate,
    db: Session = Depends(get_db)
):
    """
    Crear nueva teoría
    """
    try:
        nueva_teoria_obj = create_teoria_db(db, teoria=teoria)
        
        # Convertir manualmente
        nueva_teoria_schema = convert_teoria_to_schema(nueva_teoria_obj)
        
        logger.info(f"Creada nueva teoría: {nueva_teoria_obj.titulo}")
        return nueva_teoria_schema
        
    except Exception as e:
        logger.error(f"Error creando teoría: {e}")
        raise HTTPException(status_code=500, detail="Error creando teoría")

@router.put("/{teoria_id}", response_model=Teoria)
def update_teoria(
    teoria_id: int,
    teoria_update: TeoriaUpdate,
    db: Session = Depends(get_db)
):
    """
    Actualizar teoría existente
    """
    try:
        teoria_actualizada_obj = update_teoria_db(db, teoria_id=teoria_id, teoria_update=teoria_update)
        if not teoria_actualizada_obj:
            raise HTTPException(status_code=404, detail="Teoría no encontrada")
        
        # Convertir manualmente
        teoria_actualizada_schema = convert_teoria_to_schema(teoria_actualizada_obj)
        
        logger.info(f"Actualizada teoría ID: {teoria_id}")
        return teoria_actualizada_schema
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error actualizando teoría {teoria_id}: {e}")
        raise HTTPException(status_code=500, detail="Error actualizando teoría")

@router.delete("/{teoria_id}")
def delete_teoria(
    teoria_id: int,
    db: Session = Depends(get_db)
):
    """
    Eliminar teoría
    """
    try:
        success = delete_teoria_db(db, teoria_id=teoria_id)
        if not success:
            raise HTTPException(status_code=404, detail="Teoría no encontrada")
        
        logger.info(f"Eliminada teoría ID: {teoria_id}")
        return {"message": "Teoría eliminada exitosamente"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error eliminando teoría {teoria_id}: {e}")
        raise HTTPException(status_code=500, detail="Error eliminando teoría")

# --- ENDPOINTS DE PROGRESO DE USUARIO ---

@router.post("/{teoria_id}/marcar-leida")
def marcar_teoria_leida(
    teoria_id: int,
    usuario_data: dict = Body(...),  # CORREGIDO: usar Body para recibir JSON
    db: Session = Depends(get_db)
):
    """
    Marcar una teoría como leída por un usuario - CORREGIDO
    """
    try:
        usuario_id = usuario_data.get('usuario_id', 1)  # Usuario por defecto
        
        # Verificar que la teoría existe
        teoria = get_teoria_db(db, teoria_id=teoria_id)
        if not teoria:
            raise HTTPException(status_code=404, detail="Teoría no encontrada")
        
        # Marcar como leída
        success = marcar_teoria_como_leida(db, usuario_id=usuario_id, teoria_id=teoria_id)
        if not success:
            raise HTTPException(status_code=500, detail="Error marcando como leída")
        
        logger.info(f"Teoría {teoria_id} marcada como leída por usuario {usuario_id}")
        return {
            "message": "Teoría marcada como leída", 
            "teoria_id": teoria_id, 
            "usuario_id": usuario_id,
            "status": "success"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marcando teoría como leída: {e}")
        raise HTTPException(status_code=500, detail="Error interno del servidor")

@router.get("/progreso/{usuario_id}", response_model=List[ProgresoUsuario])
def get_progreso_usuario(
    usuario_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtener el progreso de lectura de un usuario - CORREGIDO
    """
    try:
        progreso_objs = get_progreso_usuario_db(db, usuario_id=usuario_id)
        
        # Convertir manualmente cada progreso
        progreso_response = []
        for progreso_obj in progreso_objs:
            progreso_schema = ProgresoUsuario(
                teoria_id=progreso_obj.teoria_id,  # CORREGIDO
                leido=progreso_obj.leido,
                fecha=progreso_obj.fecha.isoformat() if progreso_obj.fecha else None
            )
            progreso_response.append(progreso_schema)
        
        logger.info(f"Obtenido progreso para usuario {usuario_id}: {len(progreso_response)} registros")
        return progreso_response
        
    except Exception as e:
        logger.error(f"Error obteniendo progreso de usuario {usuario_id}: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo progreso")

@router.get("/estadisticas/{usuario_id}")
def get_estadisticas_progreso(
    usuario_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtener estadísticas de progreso de un usuario - CORREGIDO
    """
    try:
        total_teorias = get_total_teorias(db)
        teorias_leidas = get_teorias_leidas_usuario(db, usuario_id=usuario_id)
        porcentaje = round((teorias_leidas / total_teorias * 100), 2) if total_teorias > 0 else 0
        
        estadisticas = {
            "usuario_id": usuario_id,
            "total_teorias": total_teorias,
            "teorias_leidas": teorias_leidas,
            "teorias_pendientes": total_teorias - teorias_leidas,
            "porcentaje_completado": porcentaje,
            "status": "success"
        }
        
        logger.info(f"Estadísticas para usuario {usuario_id}: {porcentaje}% completado")
        return estadisticas
    
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas de usuario {usuario_id}: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo estadísticas")

# --- ENDPOINTS DE TAREAS ---

@router.get("/{teoria_id}/tareas", response_model=List[TareaTeorica])
def get_tareas_teoria(
    teoria_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtener tareas/ejercicios relacionados con una teoría - CORREGIDO
    """
    try:
        # Verificar que la teoría existe
        teoria = get_teoria_db(db, teoria_id=teoria_id)
        if not teoria:
            raise HTTPException(status_code=404, detail="Teoría no encontrada")
        
        tareas_objs = get_tareas_by_teoria_id(db, teoria_id=teoria_id)
        
        # Convertir manualmente cada tarea
        tareas_response = []
        for tarea_obj in tareas_objs:
            tarea_schema = TareaTeorica(
                id=tarea_obj.id_teoria_tarea_simulacion,
                teoria_id=tarea_obj.teoria_id,  # CORREGIDO
                reaccion_id=tarea_obj.reaccion_id,  # CORREGIDO
                descripcion_tarea=tarea_obj.descripcion_tarea,
                dificultad=tarea_obj.dificultad
            )
            tareas_response.append(tarea_schema)
        
        logger.info(f"Obtenidas {len(tareas_response)} tareas para teoría {teoria_id}")
        return tareas_response
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error obteniendo tareas para teoría {teoria_id}: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo tareas")

# --- ENDPOINTS AUXILIARES ---

@router.get("/stats/general")
def get_estadisticas_generales(db: Session = Depends(get_db)):
    """
    Obtener estadísticas generales del sistema de teoría
    """
    try:
        total_teorias = get_total_teorias(db)
        total_categorias = len(get_categorias_disponibles(db))
        teoria_mas_leida = get_teoria_mas_leida(db)
        
        stats = {
            "total_teorias": total_teorias,
            "total_categorias": total_categorias,
            "teoria_mas_leida": teoria_mas_leida,
            "sistema_activo": True,
            "status": "success"
        }
        
        logger.info("Obtenidas estadísticas generales del sistema")
        return stats
    
    except Exception as e:
        logger.error(f"Error obteniendo estadísticas generales: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo estadísticas")

@router.get("/recomendaciones/{usuario_id}", response_model=List[Teoria])
def get_teorias_recomendadas(
    usuario_id: int,
    limit: int = Query(5, ge=1, le=10, description="Número de recomendaciones"),
    db: Session = Depends(get_db)
):
    """
    Obtener teorías recomendadas para un usuario basado en su progreso - CORREGIDO
    """
    try:
        # Lógica simple: recomendar teorías no leídas de categorías con progreso
        progreso = get_progreso_usuario_db(db, usuario_id=usuario_id)
        teorias_leidas = [p.teoria_id for p in progreso if p.leido]  # CORREGIDO
        
        if not teorias_leidas:
            # Si no ha leído nada, recomendar desde Fundamentos
            recomendadas_objs = get_teorias_by_categoria_db(db, categoria="Fundamentos", limit=limit)
        else:
            # Recomendar teorías no leídas
            recomendadas_objs = get_teorias_no_leidas(db, usuario_id=usuario_id, limit=limit)
        
        # Convertir manualmente cada recomendación
        recomendadas_response = []
        for teoria_obj in recomendadas_objs:
            teoria_schema = convert_teoria_to_schema(teoria_obj)
            recomendadas_response.append(teoria_schema)
        
        logger.info(f"Obtenidas {len(recomendadas_response)} recomendaciones para usuario {usuario_id}")
        return recomendadas_response
    
    except Exception as e:
        logger.error(f"Error obteniendo recomendaciones para usuario {usuario_id}: {e}")
        raise HTTPException(status_code=500, detail="Error obteniendo recomendaciones")