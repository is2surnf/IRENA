# app/schemas/elemento.py
from pydantic import BaseModel, Field, field_validator
from typing import Optional
from decimal import Decimal

class ElementoBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    simbolo: Optional[str] = Field(None, max_length=10)
    numero_atomico: Optional[int] = Field(None, ge=1, le=118)
    masa_atomica: Optional[Decimal] = Field(None, ge=0)
    densidad: Optional[Decimal] = Field(None, ge=0)
    estado: Optional[str] = Field(None, max_length=20)
    descripcion: Optional[str] = None
    categoria: Optional[str] = Field(None, max_length=50)
    imagen_url: Optional[str] = Field(None, description="URL de la imagen del elemento")

    @field_validator('estado')
    @classmethod
    def validate_estado(cls, v):
        if v is not None:
            estados_validos = ['Gas', 'Líquido', 'Sólido']
            if v not in estados_validos:
                raise ValueError(f'Estado debe ser uno de: {", ".join(estados_validos)}')
        return v

    @field_validator('categoria')
    @classmethod
    def validate_categoria(cls, v):
        if v is not None:
            categorias_validas = ['Metales', 'No metales', 'Gases y Halógenos', 'Ácidos', 'Bases', 'Sales']
            if v not in categorias_validas:
                raise ValueError(f'Categoría debe ser una de: {", ".join(categorias_validas)}')
        return v

class ElementoCreate(ElementoBase):
    pass

class ElementoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    simbolo: Optional[str] = Field(None, max_length=10)
    numero_atomico: Optional[int] = Field(None, ge=1, le=118)
    masa_atomica: Optional[Decimal] = Field(None, ge=0)
    densidad: Optional[Decimal] = Field(None, ge=0)
    estado: Optional[str] = Field(None, max_length=20)
    descripcion: Optional[str] = None
    categoria: Optional[str] = Field(None, max_length=50)
    imagen_url: Optional[str] = None

    @field_validator('estado')
    @classmethod
    def validate_estado(cls, v):
        if v is not None:
            estados_validos = ['Gas', 'Líquido', 'Sólido']
            if v not in estados_validos:
                raise ValueError(f'Estado debe ser uno de: {", ".join(estados_validos)}')
        return v

    @field_validator('categoria')
    @classmethod
    def validate_categoria(cls, v):
        if v is not None:
            categorias_validas = ['Metales', 'No metales', 'Gases y Halógenos', 'Ácidos', 'Bases', 'Sales']
            if v not in categorias_validas:
                raise ValueError(f'Categoría debe ser una de: {", ".join(categorias_validas)}')
        return v

class Elemento(ElementoBase):
    id: int = Field(..., description="ID único del elemento")
    
    class Config:
        from_attributes = True
        
        json_schema_extra = {
            "example": {
                "id": 1,
                "nombre": "Hidrógeno",
                "simbolo": "H",
                "numero_atomico": 1,
                "masa_atomica": 1.008,
                "densidad": 0.0899,
                "estado": "Gas",
                "descripcion": "Gas inflamable, base de reacciones de combustión",
                "categoria": "No metales",
                "imagen_url": "hidrogeno.png"
            }
        }

# Schema para respuestas de listas
class ElementosResponse(BaseModel):
    items: list[Elemento]
    total: int
    page: int
    size: int

# Schema para búsqueda
class ElementoSearch(BaseModel):
    search_term: Optional[str] = None
    categoria: Optional[str] = None
    estado: Optional[str] = None
    page: int = Field(1, ge=1)
    size: int = Field(50, ge=1, le=100)