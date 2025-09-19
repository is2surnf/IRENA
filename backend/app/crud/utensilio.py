# app/crud/utensilio.py
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from app.models.utensilio import Utensilio
from app.schemas.utensilio import UtensilioCreate, UtensilioUpdate

def get_utensilio(db: Session, utensilio_id: int) -> Optional[Utensilio]:
    """Obtener un utensilio por ID"""
    return db.query(Utensilio).filter(Utensilio.id_utensilio == utensilio_id).first()

def get_utensilios(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    tipo: Optional[str] = None
) -> List[Utensilio]:
    """Obtener lista de utensilios con filtros opcionales"""
    query = db.query(Utensilio)
    
    if tipo:
        query = query.filter(Utensilio.tipo == tipo)
    
    return query.offset(skip).limit(limit).all()

def search_utensilios(
    db: Session, 
    search_term: str, 
    tipo: Optional[str] = None
) -> List[Utensilio]:
    """Buscar utensilios por nombre o descripción"""
    query = db.query(Utensilio).filter(
        func.lower(Utensilio.nombre).contains(search_term.lower()) |
        func.lower(Utensilio.descripcion).contains(search_term.lower())
    )
    
    if tipo:
        query = query.filter(Utensilio.tipo == tipo)
    
    return query.all()

def get_utensilios_by_tipo(db: Session, tipo: str) -> List[Utensilio]:
    """Obtener utensilios por tipo específico"""
    return db.query(Utensilio).filter(Utensilio.tipo == tipo).all()

def create_utensilio(db: Session, utensilio: UtensilioCreate) -> Utensilio:
    """Crear nuevo utensilio"""
    db_utensilio = Utensilio(
        nombre=utensilio.nombre,
        descripcion=utensilio.descripcion,
        capacidad=utensilio.capacidad,
        tipo=utensilio.tipo,
        imagen_url=utensilio.imagen_url  # Campo agregado
    )
    db.add(db_utensilio)
    db.commit()
    db.refresh(db_utensilio)
    return db_utensilio

def update_utensilio(
    db: Session, 
    utensilio_id: int, 
    utensilio_update: UtensilioUpdate
) -> Optional[Utensilio]:
    """Actualizar utensilio existente"""
    db_utensilio = get_utensilio(db, utensilio_id)
    if not db_utensilio:
        return None
    
    update_data = utensilio_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_utensilio, field, value)
    
    db.commit()
    db.refresh(db_utensilio)
    return db_utensilio

def delete_utensilio(db: Session, utensilio_id: int) -> bool:
    """Eliminar utensilio"""
    db_utensilio = get_utensilio(db, utensilio_id)
    if not db_utensilio:
        return False
    
    db.delete(db_utensilio)
    db.commit()
    return True