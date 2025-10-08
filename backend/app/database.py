# app/database.py
from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)

# Configuración de base de datos con manejo de errores mejorado
try:
    # Crear el engine de la base de datos
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,  # Verificar conexión antes de usar
        pool_size=5,         # Reducido para desarrollo
        max_overflow=10,     # Reducido para desarrollo
        echo=settings.DEBUG, # Mostrar queries SQL en debug
        pool_recycle=3600    # Reciclar conexiones cada hora
    )
    
    # Crear SessionLocal para manejar sesiones de DB
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Base declarativa para los modelos
    Base = declarative_base()
    
    logger.info("✅ Configuración de base de datos inicializada correctamente")
    
except Exception as e:
    logger.warning(f"⚠️ Error configurando base de datos: {e}")
    logger.info("🔄 Usando configuración de fallback para desarrollo")
    
    # Configuración de fallback para desarrollo sin BD
    engine = None
    SessionLocal = None
    Base = declarative_base()

def get_db():
    """
    Dependency para obtener sesión de base de datos
    """
    if SessionLocal is None:
        logger.warning("⚠️ Base de datos no configurada - usando datos mock")
        return None
        
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
        if engine is None:
            logger.warning("⚠️ No se puede inicializar BD - engine no disponible")
            return False
            
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Tablas de base de datos creadas correctamente")
        return True
    except Exception as e:
        logger.error(f"❌ Error al crear tablas: {e}")
        return False

def test_db_connection():
    """
    Probar conexión a la base de datos
    """
    try:
        if SessionLocal is None:
            logger.warning("⚠️ SessionLocal no disponible - BD no configurada")
            return False
            
        db = SessionLocal()
        # CORRECCIÓN: Usar text() para SQL literal
        db.execute(text("SELECT 1"))
        db.close()
        logger.info("✅ Conexión a base de datos exitosa")
        return True
    except Exception as e:
        logger.warning(f"⚠️ Error de conexión a base de datos: {e}")
        return False

# Verificar conexión al importar
db_available = test_db_connection()
if not db_available:
    logger.info("🔄 Funcionando en modo de desarrollo sin base de datos")