# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Crear el engine de la base de datos
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,  # Verificar conexión antes de usar
    pool_size=10,        # Tamaño del pool de conexiones
    max_overflow=20,     # Conexiones adicionales permitidas
    echo=settings.DEBUG  # Mostrar queries SQL en debug
)

# Crear SessionLocal para manejar sesiones de DB
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base declarativa para los modelos
Base = declarative_base()

def get_db():
    """
    Dependency para obtener sesión de base de datos
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        logger.error(f"Error en sesión de base de datos: {e}")
        db.rollback()
        raise
    finally:
        db.close()

def init_db():
    """
    Inicializar base de datos creando todas las tablas
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Tablas de base de datos creadas correctamente")
    except Exception as e:
        logger.error(f"❌ Error al crear tablas: {e}")
        raise

def test_db_connection():
    """
    Probar conexión a la base de datos
    """
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        logger.info("✅ Conexión a base de datos exitosa")
        return True
    except Exception as e:
        logger.error(f"❌ Error de conexión a base de datos: {e}")
        return False