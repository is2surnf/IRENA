# app/core/config.py 
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator
from typing import List, Union
import logging

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    # --- Configuración general ---
    PROJECT_NAME: str = "API de Progreso IReNaTech"
    API_PREFIX: str = "/api"
    DEBUG: bool = True
    VERSION: str = "2.1.0"

    # --- Base de datos ---
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/irenatech"

    @validator("DATABASE_URL", pre=True)
    def validate_database_url(cls, v):
        if not v or not v.startswith("postgresql://"):
            logger.warning("⚠️ DATABASE_URL no está configurada correctamente")
            # Valor por defecto para desarrollo
            return "postgresql://postgres:password@localhost:5432/irenatech"
        return v

    # --- CORS - CONFIGURACIÓN CORREGIDA ---
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] | str = [
        "http://localhost:3000",
        "http://127.0.0.1:3000", 
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "http://localhost:4173",  # Vite preview
        "http://127.0.0.1:4173",
    ]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(f"Invalid CORS origins format: {v}")

    # --- Seguridad ---
    SECRET_KEY: str = "irenatech-super-secret-key-for-development-only"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 horas

    # --- IA / Google Gemini ---
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash-latest"

    @validator("GEMINI_API_KEY", pre=True)
    def validate_gemini_key(cls, v):
        if not v:
            logger.warning("⚠️ GEMINI_API_KEY no está configurada")
        elif len(v) < 20:
            logger.warning("⚠️ GEMINI_API_KEY parece ser muy corta")
        return v

    # --- Configuración específica del servicio de progreso ---
    PROGRESO_CACHE_TTL_MINUTES: int = 5
    PROGRESO_MAX_REQUESTS_PER_MINUTE: int = 60
    PROGRESO_ENABLE_MOCK_DATA: bool = False  # Para desarrollo sin BD
    
    # --- Logging ---
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

# Crear instancia global de configuración
settings = Settings()

# Configurar logging basado en settings
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper()),
    format=settings.LOG_FORMAT
)

# Log de configuración al importar (solo en desarrollo)
if settings.DEBUG:
    logger.info("⚙️ Configuración cargada:")
    logger.info(f"  - PROJECT_NAME: {settings.PROJECT_NAME}")
    logger.info(f"  - VERSION: {settings.VERSION}")
    logger.info(f"  - API_PREFIX: {settings.API_PREFIX}")
    logger.info(f"  - DEBUG: {settings.DEBUG}")
    logger.info(f"  - DATABASE_URL: {settings.DATABASE_URL[:30]}...")
    logger.info(f"  - CORS_ORIGINS: {len(settings.BACKEND_CORS_ORIGINS)} orígenes configurados")
    logger.info(f"  - GEMINI_KEY configurada: {'✅' if settings.GEMINI_API_KEY else '❌'}")
    logger.info(f"  - GEMINI_MODEL: {settings.GEMINI_MODEL}")
    logger.info(f"  - CACHE_TTL: {settings.PROGRESO_CACHE_TTL_MINUTES} minutos")
    logger.info(f"  - MOCK_DATA: {'✅' if settings.PROGRESO_ENABLE_MOCK_DATA else '❌'}")

# Función para verificar configuración
def check_configuration() -> dict:
    """Verificar que la configuración esté completa"""
    issues = []
    status = "ok"
    
    # Verificar BD
    if not settings.DATABASE_URL or "localhost" in settings.DATABASE_URL:
        issues.append("DATABASE_URL parece ser de desarrollo")
    
    # Verificar Gemini
    if not settings.GEMINI_API_KEY:
        issues.append("GEMINI_API_KEY no configurada")
    
    # Verificar CORS
    if len(settings.BACKEND_CORS_ORIGINS) == 0:
        issues.append("No hay orígenes CORS configurados")
        status = "warning"
    
    if issues:
        status = "warning" if status == "ok" else "error"
    
    return {
        "status": status,
        "issues": issues,
        "config": {
            "project": settings.PROJECT_NAME,
            "version": settings.VERSION,
            "debug": settings.DEBUG,
            "database_configured": bool(settings.DATABASE_URL),
            "gemini_configured": bool(settings.GEMINI_API_KEY),
            "cors_origins": len(settings.BACKEND_CORS_ORIGINS)
        }
    }

# Exportar configuración y función de verificación
__all__ = ["settings", "check_configuration"]