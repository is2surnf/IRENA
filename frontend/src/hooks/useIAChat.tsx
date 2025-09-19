// src/hooks/useIAChat.tsx
import { useCallback, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { askIA, testConnection, getEnvironmentInfo } from "../services/ia.service";
import type { ChatMessage } from "../components/ia/MessageBubble";

const WELCOME: ChatMessage = {
  id: uuid(),
  role: "assistant",
  content: "¡Bienvenido! Soy el Asistente Químico de IReNaTech. Puedo explicar teoría, balancear ecuaciones, proponer simulaciones seguras y más. ¿Qué necesitas hoy?",
  createdAt: Date.now(),
};

const STORAGE_KEY = "irenatech.chat";

type ConnectionStatus = 'checking' | 'connected' | 'disconnected' | 'error';

interface ChatError {
  message: string;
  type: 'connection' | 'api' | 'validation' | 'unknown';
  timestamp: number;
}

export default function useIAChat() {
  // Estados principales
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validar que es un array válido
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn("⚠️ Error loading saved messages, starting fresh:", error);
    }
    return [WELCOME];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('checking');

  // Estados de debug
  const [debugInfo, setDebugInfo] = useState<any>(null);

  // Verificar conexión al montar el componente
  useEffect(() => {
    const checkConnection = async () => {
      try {
        console.log("🔍 Checking initial connection...");
        const result = await testConnection();
        
        setConnectionStatus(result.connected ? 'connected' : 'disconnected');
        setDebugInfo({
          environment: getEnvironmentInfo(),
          connectionTest: result
        });
        
        if (!result.connected) {
          setError({
            message: "No se pudo conectar con el servidor. Verifica que esté ejecutándose.",
            type: 'connection',
            timestamp: Date.now()
          });
        }
      } catch (error: any) {
        console.error("🚨 Connection check failed:", error);
        setConnectionStatus('error');
        setError({
          message: `Error al verificar conexión: ${error.message}`,
          type: 'connection',
          timestamp: Date.now()
        });
      }
    };
    
    checkConnection();
  }, []);

  // Guardar mensajes en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.warn("⚠️ Error saving messages to localStorage:", error);
    }
  }, [messages]);

  // Función para enviar mensajes
  const sendMessage = useCallback(async (text: string) => {
    const trimmedText = text.trim();
    
    if (!trimmedText) {
      console.warn("⚠️ Attempted to send empty message");
      return;
    }
    
    if (isLoading) {
      console.warn("⚠️ Message sending already in progress");
      return;
    }
    
    console.group("💬 Sending message");
    console.log("📝 User input:", trimmedText);
    console.log("🗃️ Current messages count:", messages.length);
    
    // Limpiar error previo
    setError(null);
    
    // Crear mensaje del usuario
    const userMsg: ChatMessage = { 
      id: uuid(), 
      role: "user", 
      content: trimmedText, 
      createdAt: Date.now() 
    };
    
    // Agregar mensaje del usuario inmediatamente
    setMessages(prev => {
      const updated = [...prev, userMsg];
      console.log("📚 Messages after user:", updated.length);
      return updated;
    });

    setIsLoading(true);
    
    try {
      // Crear mensaje temporal del asistente
      const assistantId = uuid();
      const tempAssistantMsg: ChatMessage = { 
        id: assistantId, 
        role: "assistant", 
        content: "", 
        createdAt: Date.now() 
      };
      
      setMessages(prev => [...prev, tempAssistantMsg]);

      // Preparar contexto para la API (mensajes previos + mensaje actual)
      const contextMessages = [...messages, userMsg];
      
      // Limitar contexto para evitar tokens excesivos (últimos 10 mensajes)
      const limitedContext = contextMessages.slice(-10);
      
      const apiPayload = limitedContext.map(m => ({ 
        role: m.role as "user" | "assistant", 
        content: m.content 
      }));
      
      console.log("📤 API Payload:", {
        messageCount: apiPayload.length,
        totalCharacters: apiPayload.reduce((sum, m) => sum + m.content.length, 0),
        lastUserMessage: apiPayload[apiPayload.length - 1]
      });

      // Llamar a la API
      const startTime = Date.now();
      const reply = await askIA(apiPayload);
      const responseTime = Date.now() - startTime;
      
      console.log("📨 API Response received:", {
        responseTime: `${responseTime}ms`,
        replyLength: reply.length,
        replyPreview: reply.substring(0, 100) + (reply.length > 100 ? "..." : "")
      });

      // Validar respuesta
      if (!reply || reply.trim().length === 0) {
        throw new Error("El servidor devolvió una respuesta vacía");
      }

      // Actualizar el mensaje del asistente con la respuesta
      setMessages(prev =>
        prev.map(m => 
          m.id === assistantId 
            ? { ...m, content: reply }
            : m
        )
      );
      
      console.log("✅ Message sent successfully");
      
    } catch (e: any) {
      console.error("🚨 Error sending message:", e);
      
      // Remover el mensaje temporal del asistente si hay error
      setMessages(prev => prev.filter(m => !(m.role === "assistant" && m.content === "")));
      
      // Categorizar el error
      let errorType: ChatError['type'] = 'unknown';
      let errorMessage = e?.message || "Error desconocido";
      
      if (errorMessage.includes('fetch') || errorMessage.includes('conexión')) {
        errorType = 'connection';
        errorMessage = "Error de conexión. Verifica que el servidor esté ejecutándose.";
      } else if (errorMessage.includes('HTTP')) {
        errorType = 'api';
      } else if (errorMessage.includes('invalid') || errorMessage.includes('inválid')) {
        errorType = 'validation';
      }
      
      setError({
        message: errorMessage,
        type: errorType,
        timestamp: Date.now()
      });
      
      // Intentar reconectar si es error de conexión
      if (errorType === 'connection') {
        setConnectionStatus('disconnected');
        setTimeout(async () => {
          try {
            const result = await testConnection();
            setConnectionStatus(result.connected ? 'connected' : 'disconnected');
          } catch (e) {
            setConnectionStatus('error');
          }
        }, 2000);
      }
      
    } finally {
      setIsLoading(false);
      console.groupEnd();
    }
  }, [messages, isLoading]);

  // Función para limpiar el chat
  const clearChat = useCallback(() => {
    setMessages([WELCOME]);
    setError(null);
    console.log("🧹 Chat cleared");
  }, []);

  // Función para reintentar la conexión
  const retryConnection = useCallback(async () => {
    setConnectionStatus('checking');
    setError(null);
    
    try {
      const result = await testConnection();
      setConnectionStatus(result.connected ? 'connected' : 'disconnected');
      
      if (!result.connected) {
        setError({
          message: "Aún no se puede conectar con el servidor",
          type: 'connection',
          timestamp: Date.now()
        });
      }
    } catch (error: any) {
      setConnectionStatus('error');
      setError({
        message: `Error al reconectar: ${error.message}`,
        type: 'connection',
        timestamp: Date.now()
      });
    }
  }, []);

  // Función para obtener estadísticas del chat
  const getChatStats = useCallback(() => {
    const userMessages = messages.filter(m => m.role === 'user').length;
    const assistantMessages = messages.filter(m => m.role === 'assistant').length;
    const totalCharacters = messages.reduce((sum, m) => sum + m.content.length, 0);
    
    return {
      totalMessages: messages.length,
      userMessages,
      assistantMessages,
      totalCharacters,
      sessionStart: messages[0]?.createdAt || Date.now()
    };
  }, [messages]);

  return { 
    // Estados principales
    messages, 
    isLoading, 
    error, 
    connectionStatus,
    
    // Acciones
    sendMessage, 
    clearChat,
    retryConnection,
    
    // Utilidades
    getChatStats,
    debugInfo,
    
    // Estados computados
    isConnected: connectionStatus === 'connected',
    canSendMessage: connectionStatus === 'connected' && !isLoading,
    hasError: error !== null
  };
}