# app/api/endpoints/chat.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict
from app.services.ia import chat_completion, chat_stream, test_gemini_connection
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

class Msg(BaseModel):
    role: str
    content: str

class ChatBody(BaseModel):
    messages: List[Msg]

class ChatReply(BaseModel):
    reply: str

class HealthResponse(BaseModel):
    status: str
    service: str
    message: str
    gemini_configured: bool
    model: str = ""
    details: Dict = {}

@router.get("/health", response_model=HealthResponse)
def health_check():
    """
    Endpoint para verificar que el servicio de chat funciona con Gemini
    """
    from app.core.config import settings
    
    # Probar conexión con Gemini
    gemini_test = test_gemini_connection()
    
    return HealthResponse(
        status=gemini_test["status"],
        service="chat",
        message=gemini_test["message"],
        gemini_configured=gemini_test["gemini_configured"],
        model=settings.GEMINI_MODEL,
        details=gemini_test
    )

@router.post("/", response_model=ChatReply)
def chat_endpoint(body: ChatBody):
    """
    Endpoint para chat sin streaming usando Gemini
    """
    try:
        logger.info(f"📨 Recibida petición de chat con {len(body.messages)} mensajes")
        
        # Validar que hay mensajes
        if not body.messages:
            raise HTTPException(status_code=400, detail="No messages provided")
        
        # Convertir mensajes a formato dict
        msgs: List[Dict[str, str]] = []
        for m in body.messages:
            if not m.role or not m.content:
                raise HTTPException(status_code=400, detail="Message must have role and content")
            msgs.append({"role": m.role, "content": m.content})
        
        logger.info(
            "🔍 Mensajes procesados: %s",
            [f"{m['role']}: {m['content'][:50]}..." for m in msgs[-2:]]
        )
        
        # Obtener respuesta de Gemini
        reply = chat_completion(msgs)
        
        if not reply:
            raise HTTPException(status_code=500, detail="Empty response from Gemini service")
        
        logger.info(f"✅ Respuesta generada exitosamente: {len(reply)} caracteres")
        
        return ChatReply(reply=reply)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error en chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.post("/stream")
def chat_streaming_endpoint(body: ChatBody):
    """
    Endpoint para chat con streaming usando Gemini
    """
    try:
        logger.info(f"📡 Recibida petición de chat streaming con {len(body.messages)} mensajes")
        
        # Validar que hay mensajes
        if not body.messages:
            raise HTTPException(status_code=400, detail="No messages provided")
        
        # Convertir mensajes a formato dict
        msgs: List[Dict[str, str]] = []
        for m in body.messages:
            if not m.role or not m.content:
                raise HTTPException(status_code=400, detail="Message must have role and content")
            msgs.append({"role": m.role, "content": m.content})
        
        def generator():
            try:
                chunk_count = 0
                for chunk in chat_stream(msgs):
                    if chunk == "[DONE]":
                        logger.info(f"🏁 Stream completado con {chunk_count} chunks")
                        break
                    chunk_count += 1
                    yield f"{chunk}\n"
                yield "[DONE]\n"
            except Exception as e:
                logger.error(f"❌ Error en streaming: {str(e)}", exc_info=True)
                yield f"Error: {str(e)}\n"
                
        return StreamingResponse(
            generator(), 
            media_type="text/plain; charset=utf-8",
            headers={
                "Cache-Control": "no-cache", 
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*"
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error en chat streaming endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error interno: {str(e)}")

@router.get("/test-gemini")
def test_gemini_endpoint():
    """
    Endpoint de prueba específico para Gemini
    """
    try:
        result = test_gemini_connection()
        return {
            "endpoint": "test-gemini",
            "timestamp": "now",
            **result
        }
    except Exception as e:
        logger.error(f"❌ Error en test Gemini: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error testing Gemini: {str(e)}")