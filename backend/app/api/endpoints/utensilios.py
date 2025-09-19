# app/api/endpoints/utensilios.py
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional
from app.crud.utensilio import (
    get_utensilios, 
    get_utensilio, 
    create_utensilio, 
    update_utensilio,
    delete_utensilio,
    get_utensilios_by_tipo,
    search_utensilios
)
from app.schemas.utensilio import (
    Utensilio, 
    UtensilioCreate, 
    UtensilioUpdate,
    UtensiliosResponse,
    UtensilioSearch
)
from app.database import get_db

router = APIRouter()

def convert_utensilio_to_dict(utensilio_obj):
    """Convertir objeto ORM de utensilio a diccionario para respuesta JSON"""
    return {
        "id": utensilio_obj.id_utensilio,
        "nombre": utensilio_obj.nombre,
        "descripcion": utensilio_obj.descripcion,
        "capacidad": float(utensilio_obj.capacidad) if utensilio_obj.capacidad else None,
        "tipo": utensilio_obj.tipo,
        "imagen_url": utensilio_obj.imagen_url  # Campo agregado para las imágenes
    }

@router.get("/", response_model=List[dict])
def read_utensilios(
    skip: int = Query(0, ge=0, description="Número de elementos a omitir"),
    limit: int = Query(100, ge=1, le=200, description="Número máximo de elementos a retornar"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo de utensilio"),
    db: Session = Depends(get_db)
):
    """Obtener lista de utensilios con paginación y filtros opcionales"""
    try:
        utensilios = get_utensilios(db, skip=skip, limit=limit, tipo=tipo)
        return [convert_utensilio_to_dict(u) for u in utensilios]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.get("/search", response_model=List[dict])
def search_utensilios_endpoint(
    q: str = Query(..., min_length=2, description="Término de búsqueda"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo"),
    db: Session = Depends(get_db)
):
    """Buscar utensilios por nombre o descripción"""
    try:
        results = search_utensilios(db, search_term=q, tipo=tipo)
        return [convert_utensilio_to_dict(u) for u in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la búsqueda: {str(e)}")

@router.get("/tipos", response_model=List[str])
def get_tipos_utensilios():
    """Obtener lista de tipos de utensilios disponibles"""
    return [
        "Vidrieria y plasticos",
        "Equipos basicos", 
        "Otros materiales"
    ]

@router.get("/tipo/{tipo}", response_model=List[dict])
def read_utensilios_by_tipo(
    tipo: str = Path(..., description="Tipo de utensilio"),
    db: Session = Depends(get_db)
):
    """Obtener utensilios por tipo específico"""
    # Validar que el tipo existe
    tipos_validos = ["Vidrieria y plasticos", "Equipos basicos", "Otros materiales"]
    if tipo not in tipos_validos:
        raise HTTPException(
            status_code=400, 
            detail=f"Tipo inválido. Tipos válidos: {', '.join(tipos_validos)}"
        )
    
    try:
        utensilios = get_utensilios_by_tipo(db, tipo=tipo)
        return [convert_utensilio_to_dict(u) for u in utensilios]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener utensilios por tipo: {str(e)}")

@router.get("/{utensilio_id}", response_model=dict)
def read_utensilio(
    utensilio_id: int = Path(..., ge=1, description="ID del utensilio"),
    db: Session = Depends(get_db)
):
    """Obtener un utensilio específico por ID"""
    try:
        utensilio = get_utensilio(db, utensilio_id=utensilio_id)
        if not utensilio:
            raise HTTPException(status_code=404, detail="Utensilio no encontrado")
        return convert_utensilio_to_dict(utensilio)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener utensilio: {str(e)}")

@router.post("/", response_model=dict, status_code=201)
def create_utensilio_endpoint(
    utensilio: UtensilioCreate,
    db: Session = Depends(get_db)
):
    """Crear un nuevo utensilio"""
    try:
        new_utensilio = create_utensilio(db=db, utensilio=utensilio)
        return convert_utensilio_to_dict(new_utensilio)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear utensilio: {str(e)}")

@router.put("/{utensilio_id}", response_model=dict)
def update_utensilio_endpoint(
    utensilio_id: int = Path(..., ge=1),
    utensilio_update: UtensilioUpdate = ...,
    db: Session = Depends(get_db)
):
    """Actualizar un utensilio existente"""
    try:
        updated_utensilio = update_utensilio(
            db=db, 
            utensilio_id=utensilio_id, 
            utensilio_update=utensilio_update
        )
        if not updated_utensilio:
            raise HTTPException(status_code=404, detail="Utensilio no encontrado")
        return convert_utensilio_to_dict(updated_utensilio)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar utensilio: {str(e)}")

@router.delete("/{utensilio_id}", status_code=204)
def delete_utensilio_endpoint(
    utensilio_id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    """Eliminar un utensilio"""
    try:
        success = delete_utensilio(db=db, utensilio_id=utensilio_id)
        if not success:
            raise HTTPException(status_code=404, detail="Utensilio no encontrado")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar utensilio: {str(e)}")

# Health check específico para utensilios
@router.get("/health/status")
def health_check():
    """Health check para el servicio de utensilios"""
    return {
        "status": "healthy",
        "service": "utensilios",
        "database": "postgresql",
        "endpoints": {
            "list": "GET /",
            "search": "GET /search",
            "by_type": "GET /tipo/{tipo}",
            "detail": "GET /{id}",
            "create": "POST /",
            "update": "PUT /{id}",
            "delete": "DELETE /{id}"
        }
    }