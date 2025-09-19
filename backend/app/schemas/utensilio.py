# app/schemas/utensilio.py
from pydantic import BaseModel, Field, validator
from typing import Optional
from decimal import Decimal

class UtensilioBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    descripcion: Optional[str] = None
    capacidad: Optional[Decimal] = Field(None, ge=0, description="Capacidad en ml")
    tipo: str = Field(..., max_length=50)
    imagen_url: Optional[str] = Field(None, description="URL de la imagen del utensilio")

    @validator('tipo')
    def validate_tipo(cls, v):
        tipos_validos = [
            'Vidrieria y plasticos',
            'Equipos basicos', 
            'Otros materiales'
        ]
        if v not in tipos_validos:
            raise ValueError(f'Tipo debe ser uno de: {", ".join(tipos_validos)}')
        return v

class UtensilioCreate(UtensilioBase):
    pass

class UtensilioUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=100)
    descripcion: Optional[str] = None
    capacidad: Optional[Decimal] = Field(None, ge=0)
    tipo: Optional[str] = Field(None, max_length=50)
    imagen_url: Optional[str] = Field(None, description="URL de la imagen del utensilio")

    @validator('tipo')
    def validate_tipo(cls, v):
        if v is not None:
            tipos_validos = [
                'Vidrieria y plasticos',
                'Equipos basicos',
                'Otros materiales'
            ]
            if v not in tipos_validos:
                raise ValueError(f'Tipo debe ser uno de: {", ".join(tipos_validos)}')
        return v

class Utensilio(UtensilioBase):
    id: int = Field(..., description="ID único del utensilio")
    
    class Config:
        from_attributes = True
        
        # Cambiado de schema_extra a json_schema_extra para Pydantic V2
        json_schema_extra = {
            "example": {
                "id": 1,
                "nombre": "Matraz Erlenmeyer",
                "descripcion": "Recipiente de laboratorio con base ancha y cuello estrecho",
                "capacidad": 250.0,
                "tipo": "Vidrieria y plasticos",
                "imagen_url": "matraces_erlenmeyer.png"
            }
        }

    @classmethod
    def from_orm(cls, obj):
        """Método personalizado para convertir desde ORM"""
        return cls(
            id=obj.id_utensilio,  # Mapear id_utensilio a id
            nombre=obj.nombre,
            descripcion=obj.descripcion,
            capacidad=obj.capacidad,
            tipo=obj.tipo,
            imagen_url=obj.imagen_url  # Campo agregado
        )

# Schema para respuestas de listas
class UtensiliosResponse(BaseModel):
    items: list[Utensilio]
    total: int
    page: int
    size: int
    
# Schema para búsqueda
class UtensilioSearch(BaseModel):
    search_term: Optional[str] = None
    tipo: Optional[str] = None
    page: int = Field(1, ge=1)
    size: int = Field(50, ge=1, le=100)