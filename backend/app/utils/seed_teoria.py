# backend/app/utils/seed_teoria.py
"""
Script para poblar la base de datos con datos de ejemplo de teoría química
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import SessionLocal
from app.models.teoria import Teoria, TeoriaTareaSimulacion
import logging

logger = logging.getLogger(__name__)

# Datos de ejemplo para teorías
TEORIAS_EJEMPLO = [
    {
        "titulo": "Introducción a la Estructura Atómica",
        "contenido": """
La estructura atómica es fundamental para entender la química moderna. Un átomo está compuesto por:

1. **Núcleo**: Contiene protones (carga positiva) y neutrones (sin carga)
2. **Electrones**: Partículas con carga negativa que orbitan alrededor del núcleo

**Conceptos clave:**
- Número atómico (Z): Número de protones en el núcleo
- Número másico (A): Suma de protones y neutrones
- Isótopos: Átomos del mismo elemento con diferente número de neutrones

**Modelos atómicos históricos:**
- Modelo de Dalton (1803): Átomo como esfera indivisible
- Modelo de Thomson (1897): "Pudín de pasas"
- Modelo de Rutherford (1911): Átomo nuclear
- Modelo de Bohr (1913): Órbitas circulares
- Modelo cuántico actual: Orbitales probabilísticos

La comprensión de la estructura atómica nos permite predecir las propiedades químicas de los elementos y explicar cómo se forman los enlaces químicos.
        """,
        "categoria": "Estructura Atómica"
    },
    {
        "titulo": "Configuración Electrónica y Orbitales",
        "contenido": """
La configuración electrónica describe cómo se distribuyen los electrones en los orbitales atómicos.

**Principios fundamentales:**

1. **Principio de Aufbau**: Los electrones ocupan orbitales de menor energía primero
2. **Principio de exclusión de Pauli**: Máximo 2 electrones por orbital con spins opuestos
3. **Regla de Hund**: Un electrón por orbital antes de aparear

**Orden de llenado de orbitales:**
1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰ 4p⁶ 5s² 4d¹⁰ 5p⁶ 6s² 4f¹⁴ 5d¹⁰ 6p⁶ 7s² 5f¹⁴ 6d¹⁰ 7p⁶

**Ejemplos:**
- Hidrógeno (H): 1s¹
- Carbono (C): 1s² 2s² 2p²
- Oxígeno (O): 1s² 2s² 2p⁴
- Hierro (Fe): [Ar] 4s² 3d⁶

**Configuraciones electrónicas y propiedades:**
- Elementos con orbitales semillenos o llenos son más estables
- La configuración electrónica determina las propiedades químicas
- Los electrones de valencia participan en los enlaces químicos
        """,
        "categoria": "Estructura Atómica"
    },
    # Agregar más teorías según necesites...
]

# Datos de ejemplo para tareas de teoría
TAREAS_EJEMPLO = [
    {
        "teoria_titulo": "Introducción a la Estructura Atómica",
        "descripcion_tarea": "Determinar la configuración electrónica de los primeros 20 elementos de la tabla periódica",
        "dificultad": "Fácil"
    },
    {
        "teoria_titulo": "Introducción a la Estructura Atómica",
        "descripcion_tarea": "Calcular el número de protones, neutrones y electrones en diferentes isótopos",
        "dificultad": "Intermedio"
    },
    {
        "teoria_titulo": "Configuración Electrónica y Orbitales",
        "descripcion_tarea": "Dibujar diagramas orbitales para elementos de transición",
        "dificultad": "Intermedio"
    },
    # Agregar más tareas según necesites...
]

def seed_teoria_data():
    """
    Función para poblar la base de datos con datos de ejemplo de teoría
    """
    db = SessionLocal()
    
    try:
        logger.info("Iniciando carga de datos de ejemplo para teoría...")
        
        # Verificar si ya existen datos
        existing_teorias = db.query(Teoria).count()
        if existing_teorias > 0:
            logger.info(f"Ya existen {existing_teorias} teorías en la base de datos. Saltando carga de datos.")
            return
        
        # Crear teorías
        teoria_dict = {}  # Para mapear títulos con IDs
        
        for teoria_data in TEORIAS_EJEMPLO:
            try:
                nueva_teoria = Teoria(
                    titulo=teoria_data["titulo"],
                    contenido=teoria_data["contenido"].strip(),
                    categoria=teoria_data["categoria"]
                )
                
                db.add(nueva_teoria)
                db.flush()  # Para obtener el ID sin hacer commit
                teoria_dict[teoria_data["titulo"]] = nueva_teoria.id_teoria
                
                logger.info(f"Creada teoría: {teoria_data['titulo']}")
                
            except Exception as e:
                logger.error(f"Error creando teoría {teoria_data['titulo']}: {e}")
                continue
        
        # Crear tareas de teoría
        for tarea_data in TAREAS_EJEMPLO:
            try:
                titulo_teoria = tarea_data["teoria_titulo"]
                if titulo_teoria in teoria_dict:
                    nueva_tarea = TeoriaTareaSimulacion(
                        # CORREGIR: usar id_teoria (coincide con el esquema SQL)
                        id_teoria=teoria_dict[titulo_teoria],
                        descripcion_tarea=tarea_data["descripcion_tarea"],
                        dificultad=tarea_data["dificultad"]
                        # id_reaccion se queda como None (nullable)
                    )
                    
                    db.add(nueva_tarea)
                    logger.info(f"Creada tarea para: {titulo_teoria}")
                    
            except Exception as e:
                logger.error(f"Error creando tarea para {tarea_data['teoria_titulo']}: {e}")
                continue
        
        # Hacer commit de todos los cambios
        db.commit()
        
        # Obtener estadísticas finales
        total_teorias = db.query(Teoria).count()
        total_tareas = db.query(TeoriaTareaSimulacion).count()
        
        logger.info("✅ Carga de datos completada exitosamente:")
        logger.info(f"   - {total_teorias} teorías creadas")
        logger.info(f"   - {total_tareas} tareas creadas")
        
        # Mostrar distribución por categorías
        from sqlalchemy import func
        categorias = db.query(Teoria.categoria, func.count(Teoria.id_teoria)).group_by(Teoria.categoria).all()
        logger.info("📊 Distribución por categorías:")
        for categoria, count in categorias:
            logger.info(f"   - {categoria}: {count} teorías")
            
    except Exception as e:
        logger.error(f"Error general en carga de datos: {e}")
        db.rollback()
        raise
    
    finally:
        db.close()

def reset_teoria_data():
    """
    Función para limpiar todos los datos de teoría (usar con precaución)
    """
    db = SessionLocal()
    
    try:
        logger.warning("⚠️ Eliminando todos los datos de teoría...")
        
        # Eliminar tareas primero (por restricciones de clave foránea)
        tareas_deleted = db.query(TeoriaTareaSimulacion).delete()
        logger.info(f"Eliminadas {tareas_deleted} tareas")
        
        # Eliminar teorías
        teorias_deleted = db.query(Teoria).delete()
        logger.info(f"Eliminadas {teorias_deleted} teorías")
        
        db.commit()
        logger.info("✅ Limpieza completada")
        
    except Exception as e:
        logger.error(f"Error en limpieza de datos: {e}")
        db.rollback()
        raise
    
    finally:
        db.close()

if __name__ == "__main__":
    # Configurar logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Ejecutar carga de datos
    try:
        seed_teoria_data()
    except Exception as e:
        logger.error(f"Fallo en la carga de datos: {e}")
        exit(1)