# app/core/config.py
from pydantic_settings import BaseSettings
from pydantic import AnyHttpUrl, validator
from typing import List, Union
import logging

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    # --- Configuración general ---
    PROJECT_NAME: str = "API de Géminis"
    API_PREFIX: str = "/api"
    DEBUG: bool = True

    # --- Base de datos ---
    DATABASE_URL: str = "postgresql://user:password@localhost:5432/irenatech"

    @validator("DATABASE_URL", pre=True)
    def validate_database_url(cls, v):
        if not v or not v.startswith("postgresql://"):
            logger.warning("⚠️ DATABASE_URL no está configurada correctamente")
        return v

    # --- CORS - CONFIGURACIÓN CORREGIDA ---
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] | str = [
        "http://localhost:3000",
        "http://127.0.0.1:3000", 
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",    # Agregado para testing
        "http://127.0.0.1:8000",   # Agregado para testing
    ]

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]):
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(f"Invalid CORS origins format: {v}")

    # --- Seguridad ---
    SECRET_KEY: str = "super-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    # --- IA / Google Gemini ---
    GEMINI_API_KEY: str = ""  # Nueva variable para Gemini
    GEMINI_MODEL: str = "gemini-1.5-flash"  # Modelo por defecto

    @validator("GEMINI_API_KEY", pre=True)
    def validate_gemini_key(cls, v):
        if v and len(v) < 20:
            logger.warning("⚠️ GEMINI_API_KEY parece ser muy corta")
        return v

    class Config:
        case_sensitive = True
        env_file = ".env"
        env_file_encoding = "utf-8"

# Crear instancia global de configuración
settings = Settings()

# Log de configuración al importar (solo en desarrollo)
if settings.DEBUG:
    logger.info("⚙️ Configuración cargada:")
    logger.info(f"  - PROJECT_NAME: {settings.PROJECT_NAME}")
    logger.info(f"  - API_PREFIX: {settings.API_PREFIX}")
    logger.info(f"  - DEBUG: {settings.DEBUG}")
    logger.info(f"  - DATABASE_URL: {settings.DATABASE_URL[:20]}...")
    logger.info(f"  - CORS_ORIGINS: {settings.BACKEND_CORS_ORIGINS}")
    logger.info(f"  - GEMINI_KEY configurada: {'✅' if settings.GEMINI_API_KEY else '❌'}")
    logger.info(f"  - GEMINI_MODEL: {settings.GEMINI_MODEL}")