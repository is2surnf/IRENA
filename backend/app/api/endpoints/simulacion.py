# backend/app/api/endpoints/simulacion.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.database import get_db
from app.models.simulacion import SimulacionDB, ReaccionQuimicaDB
from app.schemas.simulacion import (
    SimulacionCreate, SimulacionResponse, EstadoSimulacion,
    DetectarReaccionRequest, ReaccionQuimica
)

logger = logging.getLogger(__name__)
router = APIRouter()

# Reacciones predefinidas (podrían venir de la BD)
REACCIONES_PREDEFINIDAS = [
    {
        "id": 1,
        "nombre": "Síntesis de Agua",
        "descripcion": "Reacción de hidrógeno con oxígeno para formar agua",
        "reactivos": ["H", "O"],
        "productos": ["H₂O"],
        "formula": "2H₂ + O₂ → 2H₂O",
        "efectos": {
            "colorFinal": "#4A90E2",
            "temperatura": 100,
            "burbujeo": False,
            "humo": True,
            "precipitado": False,
            "llama": True,
            "mensaje": "¡Agua formada! Reacción muy exotérmica"
        }
    },
    {
        "id": 2,
        "nombre": "Neutralización Ácido-Base", 
        "descripcion": "HCl reacciona con NaOH para formar sal y agua",
        "reactivos": ["HCl", "NaOH"],
        "productos": ["NaCl", "H₂O"],
        "formula": "HCl + NaOH → NaCl + H₂O",
        "efectos": {
            "colorFinal": "#ECF0F1", 
            "temperatura": 35,
            "burbujeo": False,
            "humo": False,
            "precipitado": False,
            "llama": False,
            "mensaje": "Sal común formada - pH neutro alcanzado"
        }
    }
]

@router.post("/", response_model=SimulacionResponse)
def crear_simulacion(
    simulacion: SimulacionCreate,
    db: Session = Depends(get_db)
):
    """Crear una nueva simulación"""
    try:
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
        
        return db_simulacion
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creando simulación: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error al crear simulación"
        )

@router.get("/", response_model=List[SimulacionResponse])
def listar_simulaciones(
    skip: int = 0,
    limit: int = 100,
    usuario_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """Listar todas las simulaciones"""
    query = db.query(SimulacionDB)
    
    if usuario_id:
        query = query.filter(SimulacionDB.usuario_id == usuario_id)
        
    simulaciones = query.offset(skip).limit(limit).all()
    return simulaciones

@router.get("/{simulacion_id}", response_model=SimulacionResponse)
def obtener_simulacion(simulacion_id: int, db: Session = Depends(get_db)):
    """Obtener una simulación específica"""
    simulacion = db.query(SimulacionDB).filter(SimulacionDB.id == simulacion_id).first()
    
    if not simulacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulación no encontrada"
        )
        
    return simulacion

@router.post("/detectar-reaccion", response_model=ReaccionQuimica)
def detectar_reaccion_quimica(request: DetectarReaccionRequest):
    """Detectar si los elementos pueden formar una reacción química"""
    elementos_str = ",".join(sorted(request.elementos))
    
    for reaccion_data in REACCIONES_PREDEFINIDAS:
        reactivos_str = ",".join(sorted(reaccion_data["reactivos"]))
        
        if elementos_str == reactivos_str:
            return ReaccionQuimica(**reaccion_data)
    
    # Si no hay reacción
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail="No se detectó ninguna reacción química con los elementos proporcionados"
    )

@router.get("/reacciones/disponibles", response_model=List[ReaccionQuimica])
def listar_reacciones_disponibles():
    """Listar todas las reacciones químicas disponibles"""
    return [ReaccionQuimica(**reaccion) for reaccion in REACCIONES_PREDEFINIDAS]

@router.delete("/{simulacion_id}")
def eliminar_simulacion(simulacion_id: int, db: Session = Depends(get_db)):
    """Eliminar una simulación"""
    simulacion = db.query(SimulacionDB).filter(SimulacionDB.id == simulacion_id).first()
    
    if not simulacion:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Simulación no encontrada"
        )
    
    db.delete(simulacion)
    db.commit()
    
    return {"message": "Simulación eliminada correctamente"}

@router.get("/health/status")
def health_check():
    """Health check del servicio de simulaciones"""
    return {
        "status": "healthy",
        "service": "simulaciones",
        "reacciones_disponibles": len(REACCIONES_PREDEFINIDAS)
    }