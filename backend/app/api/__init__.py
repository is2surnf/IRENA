# backend/app/api/__init__.py
from fastapi import APIRouter
from app.api.endpoints import chat, utensilios, elementos, teoria, progreso, simulacion

# Crear el router principal de la API
api_router = APIRouter()

# Incluir el router de chat
api_router.include_router(
    chat.router, 
    prefix="/chat",
    tags=["chat"]
)

# Incluir el router de utensilios
api_router.include_router(
    utensilios.router, 
    prefix="/utensilios",
    tags=["utensilios"]
)

# Incluir el router de elementos
api_router.include_router(
    elementos.router, 
    prefix="/elementos",
    tags=["elementos"]
)

# Incluir el router de teoría
api_router.include_router(
    teoria.router, 
    prefix="/teoria",
    tags=["teoria"]
)

# Incluir el router de progreso
api_router.include_router(
    progreso.router, 
    prefix="/progreso", 
    tags=["progreso"]
)

# Incluir el router de simulaciones (NUEVO)
api_router.include_router(
    simulacion.router,
    prefix="/simulacion", 
    tags=["simulacion"]
)