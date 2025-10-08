# backend/app/crud/teoria.py (VERSIÓN CORREGIDA COMPLETA)
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from typing import List, Optional, Dict, Any
from app.models.teoria import Teoria, UsuarioTeoria, TeoriaTareaSimulacion
from app.schemas.teoria import TeoriaCreate, TeoriaUpdate, ProgresoUsuarioCreate
import logging

logger = logging.getLogger(__name__)

# =====================================================
# FUNCIONES CRUD BÁSICAS PARA TEORÍAS
# =====================================================

def get_teoria_db(db: Session, teoria_id: int) -> Optional[Teoria]:
    """Obtener una teoría por ID"""
    try:
        return db.query(Teoria).filter(Teoria.id_teoria == teoria_id).first()
    except Exception as e:
        logger.error(f"Error obteniendo teoría {teoria_id}: {e}")
        return None

def get_teorias_db(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    categoria: Optional[str] = None
) -> List[Teoria]:
    """Obtener lista de teorías con filtros opcionales"""
    try:
        query = db.query(Teoria)
        
        if categoria:
            query = query.filter(Teoria.categoria == categoria)
        
        return query.offset(skip).limit(limit).all()
    except Exception as e:
        logger.error(f"Error obteniendo teorías: {e}")
        return []

def search_teorias_db(
    db: Session, 
    search_term: str, 
    categoria: Optional[str] = None
) -> List[Teoria]:
    """Buscar teorías por título o contenido"""
    try:
        query = db.query(Teoria).filter(
            or_(
                func.lower(Teoria.titulo).contains(search_term.lower()),
                func.lower(Teoria.contenido).contains(search_term.lower())
            )
        )
        
        if categoria:
            query = query.filter(Teoria.categoria == categoria)
        
        return query.all()
    except Exception as e:
        logger.error(f"Error buscando teorías: {e}")
        return []

def get_teorias_by_categoria_db(
    db: Session, 
    categoria: str, 
    limit: Optional[int] = None
) -> List[Teoria]:
    """Obtener teorías por categoría específica"""
    try:
        query = db.query(Teoria).filter(Teoria.categoria == categoria)
        
        if limit:
            query = query.limit(limit)
            
        return query.all()
    except Exception as e:
        logger.error(f"Error obteniendo teorías por categoría {categoria}: {e}")
        return []

def create_teoria_db(db: Session, teoria: TeoriaCreate) -> Teoria:
    """Crear nueva teoría"""
    try:
        db_teoria = Teoria(
            titulo=teoria.titulo,
            contenido=teoria.contenido,
            categoria=teoria.categoria
        )
        db.add(db_teoria)
        db.commit()
        db.refresh(db_teoria)
        return db_teoria
    except Exception as e:
        db.rollback()
        logger.error(f"Error creando teoría: {e}")
        raise e

def update_teoria_db(
    db: Session, 
    teoria_id: int, 
    teoria_update: TeoriaUpdate
) -> Optional[Teoria]:
    """Actualizar teoría existente"""
    try:
        db_teoria = get_teoria_db(db, teoria_id)
        if not db_teoria:
            return None
        
        update_data = teoria_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_teoria, field, value)
        
        db.commit()
        db.refresh(db_teoria)
        return db_teoria
    except Exception as e:
        db.rollback()
        logger.error(f"Error actualizando teoría {teoria_id}: {e}")
        return None

def delete_teoria_db(db: Session, teoria_id: int) -> bool:
    """Eliminar teoría"""
    try:
        db_teoria = get_teoria_db(db, teoria_id)
        if not db_teoria:
            return False
        
        db.delete(db_teoria)
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        logger.error(f"Error eliminando teoría {teoria_id}: {e}")
        return False

def get_categorias_disponibles(db: Session) -> List[str]:
    """Obtener todas las categorías únicas disponibles"""
    try:
        categorias = db.query(Teoria.categoria).distinct().all()
        return [categoria[0] for categoria in categorias]
    except Exception as e:
        logger.error(f"Error obteniendo categorías: {e}")
        return []

def get_total_teorias(db: Session) -> int:
    """Obtener el total de teorías en el sistema"""
    try:
        return db.query(Teoria).count()
    except Exception as e:
        logger.error(f"Error obteniendo total de teorías: {e}")
        return 0

# =====================================================
# FUNCIONES CRUD PARA PROGRESO DE USUARIO - CORREGIDAS
# =====================================================

def get_progreso_usuario_db(db: Session, usuario_id: int) -> List[UsuarioTeoria]:
    """Obtener el progreso de lectura de un usuario - CORREGIDO"""
    try:
        return db.query(UsuarioTeoria).filter(
            UsuarioTeoria.usuario_id == usuario_id  # CORREGIDO
        ).all()
    except Exception as e:
        logger.error(f"Error obteniendo progreso de usuario {usuario_id}: {e}")
        return []

def marcar_teoria_como_leida(db: Session, usuario_id: int, teoria_id: int) -> bool:
    """Marcar una teoría como leída por un usuario - CORREGIDO"""
    try:
        # Verificar si ya existe un registro
        existing = db.query(UsuarioTeoria).filter(
            and_(
                UsuarioTeoria.usuario_id == usuario_id,    # CORREGIDO
                UsuarioTeoria.teoria_id == teoria_id       # CORREGIDO
            )
        ).first()
        
        if existing:
            # Actualizar registro existente
            existing.leido = True
            existing.fecha = func.now()
        else:
            # Crear nuevo registro
            progreso = UsuarioTeoria(
                usuario_id=usuario_id,      # CORREGIDO
                teoria_id=teoria_id,        # CORREGIDO
                leido=True
            )
            db.add(progreso)
        
        db.commit()
        return True
    except Exception as e:
        db.rollback()
        logger.error(f"Error marcando teoría {teoria_id} como leída para usuario {usuario_id}: {e}")
        return False

def get_teorias_leidas_usuario(db: Session, usuario_id: int) -> int:
    """Obtener el número de teorías leídas por un usuario - CORREGIDO"""
    try:
        return db.query(UsuarioTeoria).filter(
            and_(
                UsuarioTeoria.usuario_id == usuario_id,  # CORREGIDO
                UsuarioTeoria.leido == True
            )
        ).count()
    except Exception as e:
        logger.error(f"Error obteniendo teorías leídas de usuario {usuario_id}: {e}")
        return 0

def get_teorias_no_leidas(db: Session, usuario_id: int, limit: int = 5) -> List[Teoria]:
    """Obtener teorías no leídas por un usuario - CORREGIDO"""
    try:
        # Subconsulta para obtener IDs de teorías ya leídas
        teorias_leidas_subquery = db.query(UsuarioTeoria.teoria_id).filter(  # CORREGIDO
            and_(
                UsuarioTeoria.usuario_id == usuario_id,  # CORREGIDO
                UsuarioTeoria.leido == True
            )
        ).subquery()
        
        # Consulta principal: teorías que NO están en la subconsulta
        return db.query(Teoria).filter(
            ~Teoria.id_teoria.in_(teorias_leidas_subquery)
        ).limit(limit).all()
        
    except Exception as e:
        logger.error(f"Error obteniendo teorías no leídas para usuario {usuario_id}: {e}")
        return []

def is_teoria_leida_por_usuario(db: Session, usuario_id: int, teoria_id: int) -> bool:
    """Verificar si una teoría específica ha sido leída por un usuario - CORREGIDO"""
    try:
        progreso = db.query(UsuarioTeoria).filter(
            and_(
                UsuarioTeoria.usuario_id == usuario_id,   # CORREGIDO
                UsuarioTeoria.teoria_id == teoria_id,     # CORREGIDO
                UsuarioTeoria.leido == True
            )
        ).first()
        
        return progreso is not None
    except Exception as e:
        logger.error(f"Error verificando si teoría {teoria_id} fue leída por usuario {usuario_id}: {e}")
        return False

# =====================================================
# FUNCIONES CRUD PARA TAREAS DE TEORÍA - CORREGIDAS
# =====================================================

def get_tareas_by_teoria_id(db: Session, teoria_id: int) -> List[TeoriaTareaSimulacion]:
    """Obtener todas las tareas relacionadas con una teoría - CORREGIDO"""
    try:
        return db.query(TeoriaTareaSimulacion).filter(
            TeoriaTareaSimulacion.teoria_id == teoria_id  # CORREGIDO
        ).all()
    except Exception as e:
        logger.error(f"Error obteniendo tareas para teoría {teoria_id}: {e}")
        return []

def create_tarea_teoria_db(db: Session, tarea: Dict[str, Any]) -> TeoriaTareaSimulacion:
    """Crear nueva tarea para una teoría - CORREGIDO"""
    try:
        db_tarea = TeoriaTareaSimulacion(
            teoria_id=tarea['teoria_id'],           # CORREGIDO
            reaccion_id=tarea.get('reaccion_id'),   # CORREGIDO
            descripcion_tarea=tarea['descripcion_tarea'],
            dificultad=tarea.get('dificultad')
        )
        db.add(db_tarea)
        db.commit()
        db.refresh(db_tarea)
        return db_tarea
    except Exception as e:
        db.rollback()
        logger.error(f"Error creando tarea: {e}")
        raise e

# =====================================================
# FUNCIONES DE ESTADÍSTICAS - CORREGIDAS
# =====================================================

def get_teoria_mas_leida(db: Session) -> Optional[Dict[str, Any]]:
    """Obtener la teoría más leída del sistema - CORREGIDO"""
    try:
        result = db.query(
            Teoria,
            func.count(UsuarioTeoria.usuario_id).label('lecturas')  # CORREGIDO
        ).join(
            UsuarioTeoria, 
            Teoria.id_teoria == UsuarioTeoria.teoria_id  # CORREGIDO
        ).filter(
            UsuarioTeoria.leido == True
        ).group_by(
            Teoria.id_teoria
        ).order_by(
            func.count(UsuarioTeoria.usuario_id).desc()  # CORREGIDO
        ).first()
        
        if result:
            teoria, lecturas = result
            return {
                'id': teoria.id_teoria,
                'titulo': teoria.titulo,
                'categoria': teoria.categoria,
                'total_lecturas': lecturas
            }
        return None
        
    except Exception as e:
        logger.error(f"Error obteniendo teoría más leída: {e}")
        return None

def get_progreso_detallado_usuario(db: Session, usuario_id: int) -> Dict[str, Any]:
    """Obtener progreso detallado de un usuario por categoría - CORREGIDO"""
    try:
        # Total de teorías por categoría
        teorias_por_categoria = db.query(
            Teoria.categoria,
            func.count(Teoria.id_teoria).label('total')
        ).group_by(Teoria.categoria).all()
        
        # Teorías leídas por categoría para el usuario
        leidas_por_categoria = db.query(
            Teoria.categoria,
            func.count(UsuarioTeoria.usuario_id).label('leidas')  # CORREGIDO
        ).join(
            UsuarioTeoria,
            Teoria.id_teoria == UsuarioTeoria.teoria_id  # CORREGIDO
        ).filter(
            and_(
                UsuarioTeoria.usuario_id == usuario_id,  # CORREGIDO
                UsuarioTeoria.leido == True
            )
        ).group_by(Teoria.categoria).all()
        
        # Convertir a diccionarios para fácil acceso
        total_dict = {categoria: total for categoria, total in teorias_por_categoria}
        leidas_dict = {categoria: leidas for categoria, leidas in leidas_por_categoria}
        
        # Combinar resultados
        progreso_por_categoria = {}
        for categoria in total_dict.keys():
            total = total_dict[categoria]
            leidas = leidas_dict.get(categoria, 0)
            progreso_por_categoria[categoria] = {
                'total': total,
                'leidas': leidas,
                'pendientes': total - leidas,
                'porcentaje': round((leidas / total * 100), 2) if total > 0 else 0
            }
        
        # Calcular totales generales
        total_general = sum(total_dict.values())
        leidas_general = sum(leidas_dict.values())
        
        return {
            'usuario_id': usuario_id,
            'resumen_general': {
                'total_teorias': total_general,
                'teorias_leidas': leidas_general,
                'teorias_pendientes': total_general - leidas_general,
                'porcentaje_completado': round((leidas_general / total_general * 100), 2) if total_general > 0 else 0
            },
            'progreso_por_categoria': progreso_por_categoria
        }
        
    except Exception as e:
        logger.error(f"Error obteniendo progreso detallado para usuario {usuario_id}: {e}")
        return {
            'usuario_id': usuario_id,
            'resumen_general': {
                'total_teorias': 0,
                'teorias_leidas': 0,
                'teorias_pendientes': 0,
                'porcentaje_completado': 0
            },
            'progreso_por_categoria': {}
        }

# =====================================================
# FUNCIONES UTILITARIAS
# =====================================================

def validar_categoria_existe(db: Session, categoria: str) -> bool:
    """Validar que una categoría existe en el sistema"""
    try:
        result = db.query(Teoria).filter(Teoria.categoria == categoria).first()
        return result is not None
    except Exception as e:
        logger.error(f"Error validando categoría {categoria}: {e}")
        return False

def contar_teorias_por_categoria(db: Session, categoria: str) -> int:
    """Contar teorías en una categoría específica"""
    try:
        return db.query(Teoria).filter(Teoria.categoria == categoria).count()
    except Exception as e:
        logger.error(f"Error contando teorías en categoría {categoria}: {e}")
        return 0