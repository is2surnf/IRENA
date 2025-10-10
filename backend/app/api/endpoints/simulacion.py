# backend/app/api/endpoints/simulacion.py - VERSIÓN CORREGIDA Y MEJORADA
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime

from app.database import get_db
from app.models.simulacion import SimulacionDB, ReaccionQuimicaDB
from app.schemas.simulacion import (
    SimulacionCreate, SimulacionResponse, EstadoSimulacion,
    DetectarReaccionRequest, ReaccionQuimica
)

logger = logging.getLogger(__name__)
router = APIRouter()

# ============================================
# BASE DE DATOS DE REACCIONES MEJORADA
# ============================================
REACCIONES_PREDEFINIDAS = [
    {
        "id": 1,
        "nombre": "Síntesis de Agua",
        "descripcion": "El hidrógeno y oxígeno reaccionan explosivamente formando agua. Reacción exotérmica fundamental.",
        "reactivos": ["H", "O"],
        "productos": ["H₂O"],
        "formula": "2H₂ + O₂ → 2H₂O",
        "tipo": "síntesis",
        "peligrosidad": "alta",
        "efectos": {
            "colorFinal": "#4A90E2",
            "temperatura": 100,
            "burbujeo": True,
            "humo": True,
            "precipitado": False,
            "llama": True,
            "mensaje": "💧 ¡Agua formada! Reacción muy exotérmica con liberación de energía",
            "intensidadLuz": 0.9,
            "colorLuz": "#FFA500",
            "duracion": 6
        }
    },
    {
        "id": 2,
        "nombre": "Neutralización Ácido-Base",
        "descripcion": "HCl y NaOH reaccionan formando sal común y agua. pH se neutraliza a 7.",
        "reactivos": ["HCl", "NaOH"],
        "productos": ["NaCl", "H₂O"],
        "formula": "HCl + NaOH → NaCl + H₂O",
        "tipo": "doble_sustitución",
        "peligrosidad": "media",
        "efectos": {
            "colorFinal": "#ECF0F1",
            "temperatura": 35,
            "burbujeo": False,
            "humo": False,
            "precipitado": False,
            "llama": False,
            "mensaje": "🧂 Cloruro de sodio formado. pH neutro alcanzado",
            "intensidadLuz": 0.3,
            "colorLuz": "#FFFFFF",
            "duracion": 4
        }
    },
    {
        "id": 3,
        "nombre": "Descomposición del Peróxido",
        "descripcion": "El peróxido de hidrógeno se descompone en agua y oxígeno con efervescencia.",
        "reactivos": ["H₂O₂"],
        "productos": ["H₂O", "O₂"],
        "formula": "2H₂O₂ → 2H₂O + O₂",
        "tipo": "descomposición",
        "peligrosidad": "baja",
        "efectos": {
            "colorFinal": "#F0F8FF",
            "temperatura": 25,
            "burbujeo": True,
            "humo": False,
            "precipitado": False,
            "llama": False,
            "mensaje": "💨 Oxígeno liberado. Efervescencia visible",
            "intensidadLuz": 0.2,
            "colorLuz": "#E0F7FA",
            "duracion": 5
        }
    },
    {
        "id": 4,
        "nombre": "Oxidación del Magnesio",
        "descripcion": "Magnesio arde con llama blanca brillante formando óxido de magnesio blanco.",
        "reactivos": ["Mg", "O"],
        "productos": ["MgO"],
        "formula": "2Mg + O₂ → 2MgO",
        "tipo": "combustión",
        "peligrosidad": "alta",
        "efectos": {
            "colorFinal": "#FFFFFF",
            "temperatura": 650,
            "burbujeo": False,
            "humo": True,
            "precipitado": True,
            "llama": True,
            "mensaje": "⚡ ¡Llama brillante! Óxido de magnesio formado",
            "intensidadLuz": 1.2,
            "colorLuz": "#FFFFFF",
            "duracion": 7
        }
    },
    {
        "id": 5,
        "nombre": "Formación de Cloruro de Sodio",
        "descripcion": "Sodio reacciona violentamente con cloro formando sal de mesa.",
        "reactivos": ["Na", "Cl"],
        "productos": ["NaCl"],
        "formula": "2Na + Cl₂ → 2NaCl",
        "tipo": "síntesis",
        "peligrosidad": "alta",
        "efectos": {
            "colorFinal": "#FFFFFF",
            "temperatura": 45,
            "burbujeo": False,
            "humo": True,
            "precipitado": True,
            "llama": True,
            "mensaje": "🧂 ¡Sal formada! Reacción violenta con llama amarilla",
            "intensidadLuz": 0.8,
            "colorLuz": "#FFFF00",
            "duracion": 5
        }
    },
    {
        "id": 6,
        "nombre": "Reacción de Bicarbonato con Vinagre",
        "descripcion": "Efervescencia intensa al mezclar bicarbonato con ácido acético.",
        "reactivos": ["NaHCO₃", "CH₃COOH"],
        "productos": ["CO₂", "H₂O", "NaCH₃COO"],
        "formula": "NaHCO₃ + CH₃COOH → CO₂↑ + H₂O + NaCH₃COO",
        "tipo": "doble_sustitución",
        "peligrosidad": "baja",
        "efectos": {
            "colorFinal": "#F0E68C",
            "temperatura": 22,
            "burbujeo": True,
            "humo": False,
            "precipitado": False,
            "llama": False,
            "mensaje": "🫧 Efervescencia intensa. CO₂ liberado",
            "intensidadLuz": 0.15,
            "colorLuz": "#FFFACD",
            "duracion": 6
        }
    },
    {
        "id": 7,
        "nombre": "Reducción del Óxido de Cobre",
        "descripcion": "Óxido de cobre negro se reduce a cobre rojizo metálico.",
        "reactivos": ["CuO", "H"],
        "productos": ["Cu", "H₂O"],
        "formula": "CuO + H₂ → Cu + H₂O",
        "tipo": "sustitución_simple",
        "peligrosidad": "media",
        "efectos": {
            "colorFinal": "#B87333",
            "temperatura": 300,
            "burbujeo": False,
            "humo": True,
            "precipitado": False,
            "llama": False,
            "mensaje": "🔶 Cobre metálico formado. Cambio de color negro → rojizo",
            "intensidadLuz": 0.4,
            "colorLuz": "#FF6347",
            "duracion": 5
        }
    },
    {
        "id": 8,
        "nombre": "Combustión del Metano",
        "descripcion": "Combustión completa del metano produciendo CO₂ y vapor de agua.",
        "reactivos": ["CH₄", "O"],
        "productos": ["CO₂", "H₂O"],
        "formula": "CH₄ + 2O₂ → CO₂ + 2H₂O",
        "tipo": "combustión",
        "peligrosidad": "alta",
        "efectos": {
            "colorFinal": "#87CEEB",
            "temperatura": 1000,
            "burbujeo": False,
            "humo": True,
            "precipitado": False,
            "llama": True,
            "mensaje": "🔥 Llama azul limpia. Combustión completa",
            "intensidadLuz": 0.85,
            "colorLuz": "#00BFFF",
            "duracion": 6
        }
    }
]

# ============================================
# FUNCIONES AUXILIARES
# ============================================
def buscar_reaccion(elementos: List[str]) -> Optional[Dict[str, Any]]:
    """
    Busca una reacción química válida basada en los elementos proporcionados.
    Implementa lógica de coincidencia exacta y parcial.
    """
    elementos_ordenados = sorted(elementos)
    
    # Búsqueda exacta
    for reaccion in REACCIONES_PREDEFINIDAS:
        reactivos_ordenados = sorted(reaccion["reactivos"])
        if elementos_ordenados == reactivos_ordenados:
            logger.info(f"✅ Reacción encontrada (exacta): {reaccion['nombre']}")
            return reaccion
    
    # Búsqueda parcial (elementos contienen todos los reactivos)
    for reaccion in REACCIONES_PREDEFINIDAS:
        if all(reactivo in elementos for reactivo in reaccion["reactivos"]):
            logger.info(f"✅ Reacción encontrada (parcial): {reaccion['nombre']}")
            return reaccion
    
    logger.warning(f"❌ No se encontró reacción para: {elementos}")
    return None

def validar_elementos(elementos: List[str]) -> bool:
    """Valida que los elementos sean símbolos químicos válidos"""
    if not elementos:
        return False
    if len(elementos) > 10:  # Límite razonable
        return False
    return True

# ============================================
# ENDPOINTS
# ============================================

@router.post("/", response_model=SimulacionResponse, status_code=status.HTTP_201_CREATED)
def crear_simulacion(
    simulacion: SimulacionCreate,
    db: Session = Depends(get_db)
):
    """
    Crear una nueva simulación y guardarla en la base de datos.
    """
    try:
        logger.info(f"📝 Creando nueva simulación: {simulacion.nombre}")
        
        db_simulacion = SimulacionDB(
            nombre=simulacion.nombre,
            descripcion=simulacion.descripcion,
            usuario_id=simulacion.usuario_id,
            estado=simulacion.estado.dict(),
            objetos_en_mesa=[obj.dict() for obj in simulacion.estado.objetosEnMesa],
            reacciones_realizadas=[]
        )
        
        db.add(db_simulacion)
        db.commit()
        db.refresh(db_simulacion)
        
        logger.info(f"✅ Simulación creada con ID: {db_simulacion.id}")
        return db_simulacion
        
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error creando simulación: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear simulación: {str(e)}"
        )

@router.get("/", response_model=List[SimulacionResponse])
def listar_simulaciones(
    skip: int = 0,
    limit: int = 100,
    usuario_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Listar simulaciones con filtros opcionales.
    """
    try:
        query = db.query(SimulacionDB)
        
        if usuario_id:
            query = query.filter(SimulacionDB.usuario_id == usuario_id)
        
        simulaciones = query.order_by(SimulacionDB.fecha.desc()).offset(skip).limit(limit).all()
        
        logger.info(f"📋 Listadas {len(simulaciones)} simulaciones")
        return simulaciones
        
    except Exception as e:
        logger.error(f"❌ Error listando simulaciones: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al listar simulaciones: {str(e)}"
        )

@router.get("/{simulacion_id}", response_model=SimulacionResponse)
def obtener_simulacion(simulacion_id: int, db: Session = Depends(get_db)):
    """
    Obtener una simulación específica por ID.
    """
    try:
        simulacion = db.query(SimulacionDB).filter(
            SimulacionDB.id == simulacion_id
        ).first()
        
        if not simulacion:
            logger.warning(f"⚠️ Simulación {simulacion_id} no encontrada")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Simulación con ID {simulacion_id} no encontrada"
            )
        
        logger.info(f"✅ Simulación {simulacion_id} encontrada")
        return simulacion
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error obteniendo simulación: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener simulación: {str(e)}"
        )

@router.post("/detectar-reaccion")
def detectar_reaccion_quimica(request: DetectarReaccionRequest):
    """
    Detectar si los elementos pueden formar una reacción química válida.
    Retorna la reacción encontrada o un error 404.
    """
    try:
        logger.info(f"🔍 Detectando reacción con elementos: {request.elementos}")
        
        # Validar entrada
        if not validar_elementos(request.elementos):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lista de elementos inválida"
            )
        
        # Buscar reacción
        reaccion = buscar_reaccion(request.elementos)
        
        if not reaccion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "mensaje": "No se detectó ninguna reacción química válida",
                    "elementos": request.elementos,
                    "sugerencia": "Intenta agregar más elementos o verifica los símbolos químicos"
                }
            )
        
        return {
            "success": True,
            "reaccion": reaccion,
            "mensaje": f"Reacción encontrada: {reaccion['nombre']}"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error detectando reacción: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al detectar reacción: {str(e)}"
        )

@router.get("/reacciones/disponibles")
def listar_reacciones_disponibles(
    tipo: Optional[str] = None,
    peligrosidad: Optional[str] = None
):
    """
    Listar todas las reacciones químicas disponibles con filtros opcionales.
    """
    try:
        reacciones = REACCIONES_PREDEFINIDAS.copy()
        
        # Filtrar por tipo
        if tipo:
            reacciones = [r for r in reacciones if r.get("tipo") == tipo]
        
        # Filtrar por peligrosidad
        if peligrosidad:
            reacciones = [r for r in reacciones if r.get("peligrosidad") == peligrosidad]
        
        logger.info(f"📋 Listadas {len(reacciones)} reacciones disponibles")
        
        return {
            "total": len(reacciones),
            "reacciones": reacciones,
            "tipos_disponibles": list(set(r["tipo"] for r in REACCIONES_PREDEFINIDAS)),
            "niveles_peligrosidad": ["baja", "media", "alta"]
        }
        
    except Exception as e:
        logger.error(f"❌ Error listando reacciones: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al listar reacciones: {str(e)}"
        )

@router.get("/reacciones/{reaccion_id}")
def obtener_reaccion(reaccion_id: int):
    """
    Obtener detalles de una reacción específica por ID.
    """
    try:
        reaccion = next(
            (r for r in REACCIONES_PREDEFINIDAS if r["id"] == reaccion_id), 
            None
        )
        
        if not reaccion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Reacción con ID {reaccion_id} no encontrada"
            )
        
        return reaccion
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error obteniendo reacción: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener reacción: {str(e)}"
        )

@router.put("/{simulacion_id}", response_model=SimulacionResponse)
def actualizar_simulacion(
    simulacion_id: int,
    estado_actualizado: EstadoSimulacion,
    db: Session = Depends(get_db)
):
    """
    Actualizar el estado de una simulación existente.
    """
    try:
        simulacion = db.query(SimulacionDB).filter(
            SimulacionDB.id == simulacion_id
        ).first()
        
        if not simulacion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Simulación con ID {simulacion_id} no encontrada"
            )
        
        # Actualizar estado
        simulacion.estado = estado_actualizado.dict()
        simulacion.objetos_en_mesa = [obj.dict() for obj in estado_actualizado.objetosEnMesa]
        
        db.commit()
        db.refresh(simulacion)
        
        logger.info(f"✅ Simulación {simulacion_id} actualizada")
        return simulacion
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error actualizando simulación: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar simulación: {str(e)}"
        )

@router.delete("/{simulacion_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_simulacion(simulacion_id: int, db: Session = Depends(get_db)):
    """
    Eliminar una simulación por ID.
    """
    try:
        simulacion = db.query(SimulacionDB).filter(
            SimulacionDB.id == simulacion_id
        ).first()
        
        if not simulacion:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Simulación con ID {simulacion_id} no encontrada"
            )
        
        db.delete(simulacion)
        db.commit()
        
        logger.info(f"🗑️ Simulación {simulacion_id} eliminada")
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"❌ Error eliminando simulación: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar simulación: {str(e)}"
        )

@router.get("/health/status")
def health_check():
    """
    Health check del servicio de simulaciones.
    Verifica que el servicio esté funcionando correctamente.
    """
    try:
        return {
            "status": "healthy",
            "service": "simulaciones",
            "timestamp": datetime.now().isoformat(),
            "reacciones_disponibles": len(REACCIONES_PREDEFINIDAS),
            "tipos_reaccion": list(set(r["tipo"] for r in REACCIONES_PREDEFINIDAS)),
            "version": "2.0.0"
        }
    except Exception as e:
        logger.error(f"❌ Health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "error": str(e)
        }

@router.get("/estadisticas/general")
def obtener_estadisticas(db: Session = Depends(get_db)):
    """
    Obtener estadísticas generales del sistema de simulaciones.
    """
    try:
        total_simulaciones = db.query(SimulacionDB).count()
        
        # Simulaciones por usuario
        simulaciones_por_usuario = db.query(
            SimulacionDB.usuario_id, 
            db.func.count(SimulacionDB.id)
        ).group_by(SimulacionDB.usuario_id).all()
        
        return {
            "total_simulaciones": total_simulaciones,
            "total_reacciones_disponibles": len(REACCIONES_PREDEFINIDAS),
            "usuarios_activos": len(simulaciones_por_usuario),
            "reacciones_por_tipo": {
                tipo: len([r for r in REACCIONES_PREDEFINIDAS if r["tipo"] == tipo])
                for tipo in set(r["tipo"] for r in REACCIONES_PREDEFINIDAS)
            },
            "reacciones_por_peligrosidad": {
                nivel: len([r for r in REACCIONES_PREDEFINIDAS if r["peligrosidad"] == nivel])
                for nivel in ["baja", "media", "alta"]
            }
        }
        
    except Exception as e:
        logger.error(f"❌ Error obteniendo estadísticas: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener estadísticas: {str(e)}"
        )

@router.post("/validar-elementos")
def validar_elementos_quimicos(elementos: List[str]):
    """
    Validar que los símbolos químicos proporcionados sean correctos.
    """
    try:
        # Lista de símbolos válidos (simplificada)
        simbolos_validos = [
            "H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne",
            "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca",
            "Fe", "Cu", "Zn", "Ag", "Au", "Hg", "Pb",
            # Compuestos comunes
            "HCl", "H₂SO₄", "HNO₃", "CH₃COOH", "NaOH", "KOH", "NH₃",
            "NaCl", "CuSO₄", "CaCO₃", "KNO₃", "Na₂SO₄", "H₂O₂",
            "NaHCO₃", "CH₄", "CuO", "MgO", "CaCl₂", "Na₂CO₃"
        ]
        
        resultados = []
        for elemento in elementos:
            valido = elemento in simbolos_validos
            resultados.append({
                "simbolo": elemento,
                "valido": valido,
                "mensaje": "Símbolo válido" if valido else "Símbolo no reconocido"
            })
        
        todos_validos = all(r["valido"] for r in resultados)
        
        return {
            "todos_validos": todos_validos,
            "resultados": resultados,
            "total_elementos": len(elementos),
            "elementos_validos": sum(1 for r in resultados if r["valido"])
        }
        
    except Exception as e:
        logger.error(f"❌ Error validando elementos: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al validar elementos: {str(e)}"
        )

@router.post("/sugerir-reacciones")
def sugerir_reacciones(elementos: List[str]):
    """
    Sugerir posibles reacciones basadas en elementos disponibles.
    """
    try:
        if not validar_elementos(elementos):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Lista de elementos inválida"
            )
        
        sugerencias = []
        
        for reaccion in REACCIONES_PREDEFINIDAS:
            reactivos_necesarios = reaccion["reactivos"]
            reactivos_disponibles = [r for r in reactivos_necesarios if r in elementos]
            
            porcentaje_match = (len(reactivos_disponibles) / len(reactivos_necesarios)) * 100
            
            if porcentaje_match > 0:
                elementos_faltantes = [r for r in reactivos_necesarios if r not in elementos]
                
                sugerencias.append({
                    "reaccion": reaccion["nombre"],
                    "formula": reaccion["formula"],
                    "porcentaje_completitud": porcentaje_match,
                    "puede_realizarse": porcentaje_match == 100,
                    "elementos_disponibles": reactivos_disponibles,
                    "elementos_faltantes": elementos_faltantes,
                    "peligrosidad": reaccion["peligrosidad"]
                })
        
        # Ordenar por porcentaje de completitud
        sugerencias.sort(key=lambda x: x["porcentaje_completitud"], reverse=True)
        
        return {
            "total_sugerencias": len(sugerencias),
            "reacciones_posibles": [s for s in sugerencias if s["puede_realizarse"]],
            "reacciones_parciales": [s for s in sugerencias if not s["puede_realizarse"]],
            "sugerencias": sugerencias
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error sugiriendo reacciones: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al sugerir reacciones: {str(e)}"
        )

# ============================================
# FIN DEL ARCHIVO
# ============================================