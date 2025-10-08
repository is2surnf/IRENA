# backend/app/schemas/simulacion.py
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

# Schemas para request/response
class ElementoBase(BaseModel):
    id: int
    nombre: str
    simbolo: str
    estado: str
    categoria: str
    descripcion: Optional[str] = None

class UtensilioBase(BaseModel):
    id: int
    nombre: str
    descripcion: str
    tipo: str
    capacidad: Optional[float] = None

class ContenidoUtensilio(BaseModel):
    elementos: List[ElementoBase] = []
    nivel: float = 0.0
    color: str = "#FFFFFF"
    temperatura: float = 25.0
    estado: str = "reposo"

class ObjetoSimulacion(BaseModel):
    id: str
    tipo: str
    data: Dict[str, Any]
    position: List[float]
    rotation: List[float] = [0, 0, 0]
    contenido: Optional[ContenidoUtensilio] = None

class EfectosReaccion(BaseModel):
    colorFinal: str
    temperatura: float
    burbujeo: bool
    humo: bool
    precipitado: bool
    llama: bool
    mensaje: str

class ReaccionQuimica(BaseModel):
    id: int
    nombre: str
    descripcion: str
    reactivos: List[str]
    productos: List[str]
    formula: str
    efectos: EfectosReaccion

class EstadoSimulacion(BaseModel):
    activa: bool = False
    objetosEnMesa: List[ObjetoSimulacion] = []
    temperatura: float = 25.0
    pH: float = 7.0
    tiempo: int = 0
    resultados: List[str] = []
    reaccionActual: Optional[ReaccionQuimica] = None

class SimulacionCreate(BaseModel):
    nombre: str
    descripcion: Optional[str] = None
    usuario_id: Optional[int] = None
    estado: EstadoSimulacion

class SimulacionResponse(BaseModel):
    id: int
    nombre: str
    fecha: datetime
    descripcion: Optional[str] = None
    estado: EstadoSimulacion
    objetos_en_mesa: List[Dict[str, Any]]
    reacciones_realizadas: Optional[List[Dict[str, Any]]] = None

    class Config:
        from_attributes = True

class DetectarReaccionRequest(BaseModel):
    utensilio_id: str
    elementos: List[str]