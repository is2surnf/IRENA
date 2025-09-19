# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.middleware.gzip import GZipMiddleware
from app.api import api_router
from app.core.config import settings
import logging
import os

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Definir origins globalmente para poder usarlos en startup
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

def create_application() -> FastAPI:
    """
    Crea y configura la aplicación FastAPI.
    """
    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="Backend robusto y escalable para IReNaTech con Google Gemini",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json"
    )

    # ----- CORS MEJORADO -----
    origins = CORS_ORIGINS.copy()
    
    # En desarrollo, permitir todos los orígenes como fallback
    if settings.DEBUG:
        origins.append("*")
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"],
        allow_headers=[
            "Accept",
            "Accept-Language", 
            "Content-Language",
            "Content-Type",
            "Authorization",
            "Origin",
            "User-Agent",
            "X-Requested-With",
        ],
        expose_headers=["*"],
        max_age=600,
    )

    # Middleware de compresión
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    # ----- Configurar archivos estáticos para imágenes -----
    # La ruta es relativa al directorio donde se ejecuta el servidor (backend/)
    # Desde backend/app/main.py, necesitamos ir un nivel arriba para llegar a backend/static
    static_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
    
    # Crear directorio de imágenes si no existe
    images_dir = os.path.join(static_path, "images", "utensilios")
    os.makedirs(images_dir, exist_ok=True)
    
    # Montar archivos estáticos
    # Esto servirá archivos desde backend/static/images/ en la URL /images/
    app.mount("/images", StaticFiles(directory=os.path.join(static_path, "images")), name="images")

    # ----- Rutas -----
    app.include_router(api_router, prefix=settings.API_PREFIX)

    # Endpoint raíz
    @app.get("/")
    def root():
        return {
            "message": "IReNaTech API is running with Google Gemini", 
            "docs": "/docs",
            "endpoints": {
                "chat_health": "/api/chat/health",
                "utensilios": "/api/utensilios/",
                "utensilios_search": "/api/utensilios/search",
                "utensilios_tipos": "/api/utensilios/tipos",
                "images": "/images/"  # Endpoint para servir imágenes
            },
            "version": "1.0.0",
            "cors_origins": CORS_ORIGINS,
            "debug": settings.DEBUG,
            "ai_service": "Google Gemini",
            "model": settings.GEMINI_MODEL,
            "static_path": static_path  # Para debug
        }

    return app

app = create_application()

# ----- Eventos -----
@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Servidor iniciado y listo para recibir solicitudes.")
    logger.info(f"📁 API Base URL: {settings.API_PREFIX}")
    logger.info(f"🤖 Servicio de IA: Google Gemini")
    logger.info(f"🔑 Gemini API Key configurada: {'✅' if settings.GEMINI_API_KEY else '❌'}")
    logger.info(f"📊 Modelo Gemini: {settings.GEMINI_MODEL}")
    logger.info(f"🧪 Endpoints de Utensilios:")
    logger.info(f"   - Lista: GET /api/utensilios/")
    logger.info(f"   - Buscar: GET /api/utensilios/search")
    logger.info(f"   - Por tipo: GET /api/utensilios/tipo/{{tipo}}")
    logger.info(f"   - Detalle: GET /api/utensilios/{{id}}")
    
    # Mostrar información del directorio estático
    static_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
    logger.info(f"🖼️  Directorio estático: {static_path}")
    logger.info(f"🖼️  Imágenes disponibles en: GET /images/utensilios/{{filename}}")
    
    logger.info(f"🌐 CORS Origins habilitados:")
    for origin in CORS_ORIGINS:
        logger.info(f"   - {origin}")
    logger.info(f"🏥 Health checks disponibles:")
    logger.info(f"   - Chat: {settings.API_PREFIX}/chat/health")
    logger.info(f"   - Utensilios: {settings.API_PREFIX}/utensilios/health/status")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Servidor detenido correctamente.")