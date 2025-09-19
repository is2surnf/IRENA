# app/api/__init__.py
from fastapi import APIRouter
from app.api.endpoints import chat, utensilios

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