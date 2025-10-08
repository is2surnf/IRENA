# app/models/elemento.py
from sqlalchemy import Column, Integer, String, Text, DECIMAL
from app.database import Base

class Elemento(Base):
    __tablename__ = "elemento"

    id_elemento = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False, index=True)
    simbolo = Column(String(10), index=True)
    numero_atomico = Column(Integer, index=True)
    masa_atomica = Column(DECIMAL(10, 2))
    densidad = Column(DECIMAL(10, 2))
    estado = Column(String(20), index=True)  # Gas, Líquido, Sólido
    descripcion = Column(Text)
    categoria = Column(String(50), index=True)  # Metales, No metales, Gases y Halógenos
    imagen_url = Column(Text)

    def __repr__(self):
        return f"<Elemento(id={self.id_elemento}, nombre='{self.nombre}', simbolo='{self.simbolo}')>"

    def to_dict(self):
        """Convertir el modelo a diccionario para serialización"""
        return {
            'id': self.id_elemento,
            'nombre': self.nombre,
            'simbolo': self.simbolo,
            'numero_atomico': self.numero_atomico,
            'masa_atomica': float(self.masa_atomica) if self.masa_atomica else None,
            'densidad': float(self.densidad) if self.densidad else None,
            'estado': self.estado,
            'descripcion': self.descripcion,
            'categoria': self.categoria,
            'imagen_url': self.imagen_url
        }