# app/crud/elemento.py
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from typing import List, Optional
from app.models.elemento import Elemento
from app.schemas.elemento import ElementoCreate, ElementoUpdate

def get_elemento(db: Session, elemento_id: int) -> Optional[Elemento]:
    """Obtener un elemento por ID"""
    return db.query(Elemento).filter(Elemento.id_elemento == elemento_id).first()

def get_elementos(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    categoria: Optional[str] = None,
    estado: Optional[str] = None
) -> List[Elemento]:
    """Obtener lista de elementos con filtros opcionales"""
    query = db.query(Elemento)
    
    if categoria:
        query = query.filter(Elemento.categoria == categoria)
    
    if estado:
        query = query.filter(Elemento.estado == estado)
    
    return query.offset(skip).limit(limit).all()

def search_elementos(
    db: Session, 
    search_term: str, 
    categoria: Optional[str] = None,
    estado: Optional[str] = None
) -> List[Elemento]:
    """Buscar elementos por nombre, símbolo o descripción"""
    query = db.query(Elemento).filter(
        or_(
            func.lower(Elemento.nombre).contains(search_term.lower()),
            func.lower(Elemento.simbolo).contains(search_term.lower()),
            func.lower(Elemento.descripcion).contains(search_term.lower())
        )
    )
    
    if categoria:
        query = query.filter(Elemento.categoria == categoria)
    
    if estado:
        query = query.filter(Elemento.estado == estado)
    
    return query.all()

def get_elementos_by_categoria(db: Session, categoria: str) -> List[Elemento]:
    """Obtener elementos por categoría específica"""
    return db.query(Elemento).filter(Elemento.categoria == categoria).all()

def get_elementos_by_estado(db: Session, estado: str) -> List[Elemento]:
    """Obtener elementos por estado específico"""
    return db.query(Elemento).filter(Elemento.estado == estado).all()

def create_elemento(db: Session, elemento: ElementoCreate) -> Elemento:
    """Crear nuevo elemento"""
    db_elemento = Elemento(
        nombre=elemento.nombre,
        simbolo=elemento.simbolo,
        numero_atomico=elemento.numero_atomico,
        masa_atomica=elemento.masa_atomica,
        densidad=elemento.densidad,
        estado=elemento.estado,
        descripcion=elemento.descripcion,
        categoria=elemento.categoria,
        imagen_url=elemento.imagen_url
    )
    db.add(db_elemento)
    db.commit()
    db.refresh(db_elemento)
    return db_elemento

def update_elemento(
    db: Session, 
    elemento_id: int, 
    elemento_update: ElementoUpdate
) -> Optional[Elemento]:
    """Actualizar elemento existente"""
    db_elemento = get_elemento(db, elemento_id)
    if not db_elemento:
        return None
    
    update_data = elemento_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_elemento, field, value)
    
    db.commit()
    db.refresh(db_elemento)
    return db_elemento

def delete_elemento(db: Session, elemento_id: int) -> bool:
    """Eliminar elemento"""
    db_elemento = get_elemento(db, elemento_id)
    if not db_elemento:
        return False
    
    db.delete(db_elemento)
    db.commit()
    return True