# app/api/endpoints/elementos.py
from fastapi import APIRouter, Depends, HTTPException, Query, Path
from sqlalchemy.orm import Session
from typing import List, Optional
from app.crud.elemento import (
    get_elementos, 
    get_elemento, 
    create_elemento, 
    update_elemento,
    delete_elemento,
    get_elementos_by_categoria,
    get_elementos_by_estado,
    search_elementos
)
from app.schemas.elemento import (
    Elemento, 
    ElementoCreate, 
    ElementoUpdate,
    ElementosResponse,
    ElementoSearch
)
from app.database import get_db

router = APIRouter()

def convert_elemento_to_dict(elemento_obj):
    """Convertir objeto ORM de elemento a diccionario para respuesta JSON"""
    return {
        "id": elemento_obj.id_elemento,
        "nombre": elemento_obj.nombre,
        "simbolo": elemento_obj.simbolo,
        "numero_atomico": elemento_obj.numero_atomico,
        "masa_atomica": float(elemento_obj.masa_atomica) if elemento_obj.masa_atomica else None,
        "densidad": float(elemento_obj.densidad) if elemento_obj.densidad else None,
        "estado": elemento_obj.estado,
        "descripcion": elemento_obj.descripcion,
        "categoria": elemento_obj.categoria,
        "imagen_url": elemento_obj.imagen_url
    }

@router.get("/", response_model=List[dict])
def read_elementos(
    skip: int = Query(0, ge=0, description="Número de elementos a omitir"),
    limit: int = Query(100, ge=1, le=200, description="Número máximo de elementos a retornar"),
    categoria: Optional[str] = Query(None, description="Filtrar por categoría de elemento"),
    estado: Optional[str] = Query(None, description="Filtrar por estado del elemento"),
    db: Session = Depends(get_db)
):
    """Obtener lista de elementos con paginación y filtros opcionales"""
    try:
        elementos = get_elementos(db, skip=skip, limit=limit, categoria=categoria, estado=estado)
        return [convert_elemento_to_dict(e) for e in elementos]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error interno del servidor: {str(e)}")

@router.get("/search", response_model=List[dict])
def search_elementos_endpoint(
    q: str = Query(..., min_length=1, description="Término de búsqueda"),
    categoria: Optional[str] = Query(None, description="Filtrar por categoría"),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    db: Session = Depends(get_db)
):
    """Buscar elementos por nombre, símbolo o descripción"""
    try:
        results = search_elementos(db, search_term=q, categoria=categoria, estado=estado)
        return [convert_elemento_to_dict(e) for e in results]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en la búsqueda: {str(e)}")

@router.get("/categorias", response_model=List[str])
def get_categorias_elementos():
    """Obtener lista de categorías de elementos disponibles"""
    return [
        "Metales",
        "No metales", 
        "Gases y Halógenos",
        "Ácidos",
        "Bases",
        "Sales"
    ]

@router.get("/estados", response_model=List[str])
def get_estados_elementos():
    """Obtener lista de estados de elementos disponibles"""
    return [
        "Gas",
        "Líquido",
        "Sólido"
    ]

@router.get("/categoria/{categoria}", response_model=List[dict])
def read_elementos_by_categoria(
    categoria: str = Path(..., description="Categoría de elemento"),
    db: Session = Depends(get_db)
):
    """Obtener elementos por categoría específica"""
    categorias_validas = ["Metales", "No metales", "Gases y Halógenos", "Ácidos", "Bases", "Sales"]
    if categoria not in categorias_validas:
        raise HTTPException(
            status_code=400, 
            detail=f"Categoría inválida. Categorías válidas: {', '.join(categorias_validas)}"
        )
    
    try:
        elementos = get_elementos_by_categoria(db, categoria=categoria)
        return [convert_elemento_to_dict(e) for e in elementos]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener elementos por categoría: {str(e)}")

@router.get("/estado/{estado}", response_model=List[dict])
def read_elementos_by_estado(
    estado: str = Path(..., description="Estado del elemento"),
    db: Session = Depends(get_db)
):
    """Obtener elementos por estado específico"""
    estados_validos = ["Gas", "Líquido", "Sólido"]
    if estado not in estados_validos:
        raise HTTPException(
            status_code=400, 
            detail=f"Estado inválido. Estados válidos: {', '.join(estados_validos)}"
        )
    
    try:
        elementos = get_elementos_by_estado(db, estado=estado)
        return [convert_elemento_to_dict(e) for e in elementos]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener elementos por estado: {str(e)}")

@router.get("/{elemento_id}", response_model=dict)
def read_elemento(
    elemento_id: int = Path(..., ge=1, description="ID del elemento"),
    db: Session = Depends(get_db)
):
    """Obtener un elemento específico por ID"""
    try:
        elemento = get_elemento(db, elemento_id=elemento_id)
        if not elemento:
            raise HTTPException(status_code=404, detail="Elemento no encontrado")
        return convert_elemento_to_dict(elemento)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener elemento: {str(e)}")

@router.post("/", response_model=dict, status_code=201)
def create_elemento_endpoint(
    elemento: ElementoCreate,
    db: Session = Depends(get_db)
):
    """Crear un nuevo elemento"""
    try:
        new_elemento = create_elemento(db=db, elemento=elemento)
        return convert_elemento_to_dict(new_elemento)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear elemento: {str(e)}")

@router.put("/{elemento_id}", response_model=dict)
def update_elemento_endpoint(
    elemento_id: int = Path(..., ge=1),
    elemento_update: ElementoUpdate = ...,
    db: Session = Depends(get_db)
):
    """Actualizar un elemento existente"""
    try:
        updated_elemento = update_elemento(
            db=db, 
            elemento_id=elemento_id, 
            elemento_update=elemento_update
        )
        if not updated_elemento:
            raise HTTPException(status_code=404, detail="Elemento no encontrado")
        return convert_elemento_to_dict(updated_elemento)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar elemento: {str(e)}")

@router.delete("/{elemento_id}", status_code=204)
def delete_elemento_endpoint(
    elemento_id: int = Path(..., ge=1),
    db: Session = Depends(get_db)
):
    """Eliminar un elemento"""
    try:
        success = delete_elemento(db=db, elemento_id=elemento_id)
        if not success:
            raise HTTPException(status_code=404, detail="Elemento no encontrado")
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar elemento: {str(e)}")

@router.get("/health/status")
def health_check():
    """Health check para el servicio de elementos"""
    return {
        "status": "healthy",
        "service": "elementos",
        "database": "postgresql",
        "endpoints": {
            "list": "GET /",
            "search": "GET /search",
            "by_category": "GET /categoria/{categoria}",
            "by_state": "GET /estado/{estado}",
            "detail": "GET /{id}",
            "create": "POST /",
            "update": "PUT /{id}",
            "delete": "DELETE /{id}"
        }
    }