# backend/app/models/teoria.py (VERSIÓN CORREGIDA COMPLETA)
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Teoria(Base):
    __tablename__ = "teoria"

    id_teoria = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(150), nullable=False, index=True)
    contenido = Column(Text, nullable=False)
    categoria = Column(String(100), nullable=False, index=True)
    
    # Relaciones - CORREGIDO: usar nombres consistentes
    progreso_usuarios = relationship("UsuarioTeoria", back_populates="teoria", cascade="all, delete-orphan")
    tareas = relationship("TeoriaTareaSimulacion", back_populates="teoria", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Teoria(id={self.id_teoria}, titulo='{self.titulo}', categoria='{self.categoria}')>"

    def to_dict(self):
        """Convertir el modelo a diccionario para serialización"""
        return {
            'id': self.id_teoria,
            'titulo': self.titulo,
            'contenido': self.contenido,
            'categoria': self.categoria
        }

class UsuarioTeoria(Base):
    __tablename__ = "usuario_teoria"

    id_usuario_teoria = Column(Integer, primary_key=True, index=True)
    # CORREGIDO: usar nombres consistentes con la base de datos
    usuario_id = Column(Integer, ForeignKey("usuario.id_usuario"), nullable=False)
    teoria_id = Column(Integer, ForeignKey("teoria.id_teoria"), nullable=False)
    leido = Column(Boolean, default=False)
    fecha = Column(DateTime, server_default=func.now())
    
    # Relaciones
    teoria = relationship("Teoria", back_populates="progreso_usuarios")

    def __repr__(self):
        return f"<UsuarioTeoria(usuario_id={self.usuario_id}, teoria_id={self.teoria_id}, leido={self.leido})>"

class TeoriaTareaSimulacion(Base):
    __tablename__ = "teoria_tarea_simulacion"

    id_teoria_tarea_simulacion = Column(Integer, primary_key=True, index=True)
    # CORREGIDO: usar nombres consistentes con la base de datos
    teoria_id = Column(Integer, ForeignKey("teoria.id_teoria"), nullable=False)
    reaccion_id = Column(Integer, ForeignKey("reaccion.id_reaccion"), nullable=True)
    descripcion_tarea = Column(Text)
    dificultad = Column(String(50))
    
    # Relaciones
    teoria = relationship("Teoria", back_populates="tareas")

    def __repr__(self):
        return f"<TeoriaTareaSimulacion(teoria_id={self.teoria_id}, dificultad='{self.dificultad}')>"

# Modelo Reaccion si no lo tienes
class Reaccion(Base):
    __tablename__ = "reaccion"
    
    id_reaccion = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    descripcion = Column(Text)
    condiciones = Column(Text)
    resultado_esperado = Column(Text)

# Modelo Usuario si no lo tienes
class Usuario(Base):
    __tablename__ = "usuario"
    
    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100))
    email = Column(String(100))
    # Agregar otros campos según tu esquema