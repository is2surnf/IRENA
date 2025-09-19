# app/models/utensilio.py
from sqlalchemy import Column, Integer, String, Text, DECIMAL
from sqlalchemy.ext.declarative import declarative_base
from app.database import Base

class Utensilio(Base):
    __tablename__ = "utensilio"

    id_utensilio = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, index=True)
    descripcion = Column(Text)
    capacidad = Column(DECIMAL(10, 2))
    tipo = Column(String(50), index=True)
    imagen_url = Column(Text)  # Campo agregado para las imágenes

    def __repr__(self):
        return f"<Utensilio(id={self.id_utensilio}, nombre='{self.nombre}', tipo='{self.tipo}')>"

    def to_dict(self):
        """Convertir el modelo a diccionario para serialización"""
        return {
            'id': self.id_utensilio,  # Mapear id_utensilio a id para compatibilidad con frontend
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'capacidad': float(self.capacidad) if self.capacidad else None,
            'tipo': self.tipo,
            'imagen_url': self.imagen_url  # Campo agregado
        }