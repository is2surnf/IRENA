# backend/app/models/simulacion.py
from sqlalchemy import Column, Integer, String, Float, Boolean, JSON, DateTime, Text
from sqlalchemy.sql import func
from app.database import Base

class SimulacionDB(Base):
    __tablename__ = "simulaciones"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, nullable=True)
    nombre = Column(String(255))
    fecha = Column(DateTime(timezone=True), server_default=func.now())
    descripcion = Column(Text, nullable=True)
    estado = Column(JSON)  # Almacena el estado completo de la simulación
    objetos_en_mesa = Column(JSON)
    reacciones_realizadas = Column(JSON, nullable=True)
    configuracion = Column(JSON, nullable=True)

class ReaccionQuimicaDB(Base):
    __tablename__ = "reacciones_quimicas"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(255))
    descripcion = Column(Text)
    reactivos = Column(JSON)  # Lista de símbolos de elementos
    productos = Column(JSON)  # Lista de símbolos de productos
    formula = Column(String(500))
    condiciones = Column(Text, nullable=True)
    efectos = Column(JSON)  # Efectos visuales
    categoria = Column(String(100))
    dificultad = Column(String(50))