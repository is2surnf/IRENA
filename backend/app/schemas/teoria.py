# backend/app/schemas/teoria.py (VERSIÓN CORREGIDA)
from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime

class TeoriaBase(BaseModel):
    titulo: str = Field(..., min_length=1, max_length=150, description="Título de la teoría")
    contenido: str = Field(..., min_length=10, description="Contenido completo de la teoría")
    categoria: str = Field(..., max_length=100, description="Categoría de la teoría")

    @validator('categoria')
    def validate_categoria(cls, v):
        categorias_validas = [
            'Fundamentos',
            'Estructura Atómica',
            'Enlace Químico',
            'Estequiometría',
            'Termoquímica',
            'Cinética Química',
            'Equilibrio Químico',
            'Ácidos y Bases',
            'Redox',
            'Química Orgánica',
            'Compuestos'  # AGREGAR categorías existentes en la BD
        ]
        # En lugar de validar estrictamente, mapear categorías incorrectas
        mapeo_categorias = {
            'Compuestos': 'Fundamentos',
            'Reacciones': 'Fundamentos'
        }
        
        categoria_corregida = mapeo_categorias.get(v, v)
        if categoria_corregida not in categorias_validas:
            # Si no está en las válidas, usar 'Fundamentos' como default
            return 'Fundamentos'
        return categoria_corregida

    @validator('titulo')
    def validate_titulo(cls, v):
        if not v.strip():
            raise ValueError('El título no puede estar vacío')
        return v.strip()

    @validator('contenido')
    def validate_contenido(cls, v):
        if len(v.strip()) < 10:
            raise ValueError('El contenido debe tener al menos 10 caracteres')
        return v.strip()

class TeoriaCreate(TeoriaBase):
    pass

class TeoriaUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=1, max_length=150)
    contenido: Optional[str] = Field(None, min_length=10)
    categoria: Optional[str] = Field(None, max_length=100)

    @validator('categoria')
    def validate_categoria(cls, v):
        if v is not None:
            categorias_validas = [
                'Fundamentos',
                'Estructura Atómica',
                'Enlace Químico',
                'Estequiometría',
                'Termoquímica',
                'Cinética Química',
                'Equilibrio Químico',
                'Ácidos y Bases',
                'Redox',
                'Química Orgánica',
                'Compuestos'
            ]
            mapeo_categorias = {
                'Compuestos': 'Fundamentos',
                'Reacciones': 'Fundamentos'
            }
            
            categoria_corregida = mapeo_categorias.get(v, v)
            if categoria_corregida not in categorias_validas:
                return 'Fundamentos'
        return v

class Teoria(TeoriaBase):
    id: int = Field(..., description="ID único de la teoría")
    leido: Optional[bool] = Field(False, description="Si el usuario actual ha leído esta teoría")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "titulo": "Introducción a la Estructura Atómica",
                "contenido": "Los átomos son las unidades básicas de la materia...",
                "categoria": "Estructura Atómica",
                "leido": False
            }
        }

# --- SCHEMAS DE PROGRESO CORREGIDOS ---

class ProgresoUsuarioBase(BaseModel):
    teoria_id: int = Field(..., description="ID de la teoría")
    leido: bool = Field(False, description="Si la teoría ha sido leída")
    fecha: Optional[str] = Field(None, description="Fecha de lectura")

class ProgresoUsuarioCreate(ProgresoUsuarioBase):
    usuario_id: int = Field(1, description="ID del usuario")

class ProgresoUsuario(ProgresoUsuarioBase):
    usuario_id: int = Field(..., description="ID del usuario")
    
    class Config:
        from_attributes = True

# --- SCHEMAS DE TAREAS ---

class TareaTeoricaBase(BaseModel):
    descripcion_tarea: str = Field(..., min_length=10, description="Descripción de la tarea")
    dificultad: Optional[str] = Field(None, description="Nivel de dificultad")
    reaccion_id: Optional[int] = Field(None, description="ID de reacción relacionada")

    @validator('dificultad')
    def validate_dificultad(cls, v):
        if v is not None:
            dificultades_validas = ['Fácil', 'Intermedio', 'Difícil', 'Avanzado']
            if v not in dificultades_validas:
                raise ValueError(f'Dificultad debe ser una de: {", ".join(dificultades_validas)}')
        return v

class TareaTeoricaCreate(TareaTeoricaBase):
    pass

class TareaTeorica(TareaTeoricaBase):
    id: int = Field(..., description="ID único de la tarea")
    teoria_id: int = Field(..., description="ID de la teoría relacionada")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "teoria_id": 1,
                "descripcion_tarea": "Resolver ejercicios sobre configuración electrónica",
                "dificultad": "Intermedio",
                "reaccion_id": None
            }
        }

# --- SCHEMAS DE RESPUESTA ---

class TeoriasResponse(BaseModel):
    items: List[Teoria]
    total: int
    page: int
    size: int
    categoria: Optional[str] = None

class TeoriaSearch(BaseModel):
    search_term: Optional[str] = None
    categoria: Optional[str] = None
    page: int = Field(1, ge=1)
    size: int = Field(50, ge=1, le=100)

class EstadisticasProgreso(BaseModel):
    usuario_id: int
    total_teorias: int
    teorias_leidas: int
    teorias_pendientes: int
    porcentaje_completado: float

class EstadisticasGenerales(BaseModel):
    total_teorias: int
    total_categorias: int
    teoria_mas_leida: Optional[dict] = None
    sistema_activo: bool = True

class ImportResult(BaseModel):
    teorias_creadas: int
    errores: int
    detalles_errores: List[str] = []
    mensaje: str