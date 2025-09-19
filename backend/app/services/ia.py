# app/services/ia.py
from typing import Iterable, List, Dict
import google.generativeai as genai
from app.core.config import settings
import logging
import json

logger = logging.getLogger(__name__)

# Configurar Gemini
if settings.GEMINI_API_KEY:
    try:
        genai.configure(api_key=settings.GEMINI_API_KEY)
        logger.info("✅ Google Gemini configurado correctamente")
    except Exception as e:
        logger.error(f"❌ Error configurando Gemini: {e}")

SYSTEM_PROMPT = (
    "Eres 'Asistente Químico' de IReNaTech. Respondes en español neutro.\n"
    "- Especialista en química (general, orgánica, inorgánica, analítica y fisicoquímica).\n"
    "- Usa unidades SI, advierte riesgos y buenas prácticas de laboratorio.\n"
    "- Balancea ecuaciones cuando sea necesario y explica pasos.\n"
    "- Mantén un tono profesional pero accesible.\n"
    "- Si no sabes algo, admítelo y sugiere recursos adicionales."
)

def _no_key_reply() -> str:
    return (
        "⚠️ **Error de Configuración**\n\n"
        "El servidor no tiene configurada la variable GEMINI_API_KEY.\n"
        "Por favor, contacta al administrador para que:\n"
        "1. Agregue la API key en el archivo .env\n"
        "2. Reinicie el servidor backend\n\n"
        "Mientras tanto, puedes revisar la documentación en /docs"
    )

def _connection_error_reply(error: str) -> str:
    return (
        f"⚠️ **Error de Conexión**\n\n"
        f"No se pudo conectar con el servicio de Google Gemini:\n"
        f"`{error}`\n\n"
        "Esto puede deberse a:\n"
        "- Problemas de red\n"
        "- API key inválida o expirada\n"
        "- Límite de uso alcanzado\n\n"
        "Por favor, inténtalo de nuevo en unos momentos."
    )

def _convert_messages_to_gemini(messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """
    Convierte el formato de mensajes de OpenAI al formato de Gemini.
    Gemini usa 'user' y 'model' en lugar de 'user' y 'assistant'.
    """
    gemini_messages = []
    
    for msg in messages:
        role = msg["role"]
        content = msg["content"]
        
        # Ignoramos el mensaje del sistema aquí porque se maneja con `system_instruction`
        if role == "user":
            gemini_messages.append({
                "role": "user", 
                "parts": [{"text": content}]
            })
        elif role == "assistant":
            gemini_messages.append({
                "role": "model",
                "parts": [{"text": content}]
            })
    
    return gemini_messages

def chat_completion(messages: List[Dict[str, str]], model: str = None) -> str:
    """
    Genera una respuesta completa usando Google Gemini
    """
    if not settings.GEMINI_API_KEY:
        logger.warning("🚨 Intento de usar IA sin API key configurada")
        return _no_key_reply()
    
    try:
        logger.info(f"🤖 Enviando {len(messages)} mensajes a Gemini (modelo: {settings.GEMINI_MODEL})")
        
        # Inicializar el modelo con el system_instruction
        gemini_model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=SYSTEM_PROMPT
        )
        
        # Convertir mensajes al formato de Gemini
        gemini_messages = _convert_messages_to_gemini(messages)
        
        # Si hay mensajes de conversación, usamos chat
        if len(gemini_messages) > 1:
            # Crear chat con historial
            chat = gemini_model.start_chat(history=gemini_messages[:-1])
            
            # Obtener el último mensaje del usuario
            last_message = gemini_messages[-1]
            if last_message["role"] == "user":
                response = chat.send_message(
                    last_message["parts"][0]["text"],
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.2,
                        max_output_tokens=2000,
                        candidate_count=1,
                    )
                )
            else:
                # Fallback: generar respuesta directa
                response = gemini_model.generate_content(
                    last_message["parts"][0]["text"],
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.2,
                        max_output_tokens=2000,
                        candidate_count=1,
                    )
                )
        else:
            # Solo un mensaje, generar respuesta directa
            user_message = gemini_messages[0]["parts"][0]["text"] if gemini_messages else "Hola"
            response = gemini_model.generate_content(
                user_message,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.2,
                    max_output_tokens=2000,
                    candidate_count=1,
                )
            )
        
        reply = response.text if response.text else ""
        
        if not reply:
            logger.warning("⚠️ Gemini devolvió una respuesta vacía")
            return "Lo siento, no pude generar una respuesta. Por favor, inténtalo de nuevo."
        
        logger.info(f"✅ Respuesta recibida de Gemini: {len(reply)} caracteres")
        return reply
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"❌ Error en chat_completion: {error_msg}", exc_info=True)
        return _connection_error_reply(error_msg)

def chat_stream(messages: List[Dict[str, str]], model: str = None) -> Iterable[str]:
    """
    Genera chunks de texto para streaming usando Google Gemini
    """
    if not settings.GEMINI_API_KEY:
        logger.warning("🚨 Intento de usar streaming sin API key configurada")
        yield _no_key_reply()
        yield "[DONE]"
        return

    try:
        logger.info(f"📡 Iniciando streaming con {len(messages)} mensajes (modelo: {settings.GEMINI_MODEL})")
        
        # Inicializar el modelo con el system_instruction
        gemini_model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=SYSTEM_PROMPT
        )
        
        # Convertir mensajes al formato de Gemini
        gemini_messages = _convert_messages_to_gemini(messages)
        
        # Preparar el contenido para streaming
        if len(gemini_messages) > 1:
            # Crear chat con historial
            chat = gemini_model.start_chat(history=gemini_messages[:-1])
            last_message = gemini_messages[-1]
            
            if last_message["role"] == "user":
                response = chat.send_message(
                    last_message["parts"][0]["text"],
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.2,
                        max_output_tokens=2000,
                        candidate_count=1,
                    ),
                    stream=True
                )
            else:
                response = gemini_model.generate_content(
                    last_message["parts"][0]["text"],
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.2,
                        max_output_tokens=2000,
                        candidate_count=1,
                    ),
                    stream=True
                )
        else:
            # Solo un mensaje
            user_message = gemini_messages[0]["parts"][0]["text"] if gemini_messages else "Hola"
            response = gemini_model.generate_content(
                user_message,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.2,
                    max_output_tokens=2000,
                    candidate_count=1,
                ),
                stream=True
            )
        
        chunk_count = 0
        for chunk in response:
            if chunk.text:
                chunk_count += 1
                yield chunk.text
        
        logger.info(f"✅ Streaming completado: {chunk_count} chunks enviados")
        yield "[DONE]"
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"❌ Error en chat_stream: {error_msg}", exc_info=True)
        yield _connection_error_reply(error_msg)
        yield "[DONE]"

# Función auxiliar para verificar la configuración de Gemini
def test_gemini_connection() -> Dict:
    """
    Prueba la conexión con Gemini y devuelve información del estado
    """
    if not settings.GEMINI_API_KEY:
        return {
            "status": "error",
            "message": "API key no configurada",
            "gemini_configured": False
        }
    
    try:
        # Probar una consulta simple
        model = genai.GenerativeModel(
            model_name=settings.GEMINI_MODEL,
            system_instruction=SYSTEM_PROMPT
        )
        response = model.generate_content(
            "Responde solo 'OK' si me recibes",
            generation_config=genai.types.GenerationConfig(
                temperature=0.1,
                max_output_tokens=10,
                candidate_count=1,
            )
        )
        
        return {
            "status": "ok",
            "message": "Conexión exitosa con Gemini",
            "gemini_configured": True,
            "model": settings.GEMINI_MODEL,
            "test_response": response.text[:50] if response.text else "Sin respuesta"
        }
    
    except Exception as e:
        return {
            "status": "error", 
            "message": f"Error de conexión: {str(e)}",
            "gemini_configured": False
        }