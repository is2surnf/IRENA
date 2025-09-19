// src/services/ia.service.ts
export type APIRole = "system" | "user" | "assistant";

// CORRECCIÓN: Usar 127.0.0.1 que es lo que está usando el servidor
const BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

// Helper para logging detallado
const logRequest = (url: string, method: string, body?: any) => {
  console.group(`🔄 API Request: ${method} ${url}`);
  console.log("🌍 Base URL:", BASE);
  console.log("📤 Request body:", body);
  console.log("🕒 Timestamp:", new Date().toISOString());
  console.groupEnd();
};

const logResponse = (url: string, status: number, data?: any, responseTime?: number) => {
  console.group(`📨 API Response: ${status} from ${url}`);
  if (responseTime) {
    console.log(`ⱶ️ Response time: ${responseTime}ms`);
  }
  if (status >= 200 && status < 300) {
    console.log("✅ Success:", data);
  } else {
    console.error("❌ Error:", data);
  }
  console.groupEnd();
};

const logError = (context: string, error: any) => {
  console.group(`🚨 ${context} Error`);
  console.error("Error object:", error);
  console.error("Error message:", error.message);
  console.error("Error stack:", error.stack);
  console.groupEnd();
};

export async function askIA(messages: { role: APIRole; content: string }[]): Promise<string> {
  const url = `${BASE}/api/chat/`;
  const startTime = Date.now();
  
  logRequest(url, "POST", { messages });

  try {
    // Validar entrada
    if (!messages || messages.length === 0) {
      throw new Error("No messages provided");
    }

    // Validar que todos los mensajes tienen role y content
    for (const msg of messages) {
      if (!msg.role || !msg.content) {
        throw new Error("All messages must have role and content");
      }
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({ messages }),
      // Agregar configuración de CORS explícita
      mode: 'cors',
      credentials: 'omit', // No enviar cookies por ahora
    });
    
    const responseTime = Date.now() - startTime;
    const responseText = await response.text();
    
    if (!response.ok) {
      logResponse(url, response.status, responseText, responseTime);
      
      // Manejar diferentes tipos de errores
      let errorMessage = `HTTP ${response.status}`;
      
      if (response.status === 404) {
        errorMessage = "Endpoint no encontrado. Verifica que el servidor esté ejecutándose.";
      } else if (response.status === 500) {
        errorMessage = "Error interno del servidor. Revisa los logs del backend.";
      } else if (response.status === 0) {
        errorMessage = "Error de conexión. Verifica que el servidor esté ejecutándose en " + BASE;
      } else {
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
      }
      
      throw new Error(errorMessage);
    }
    
    // Intentar parsear JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      logError("JSON Parse", parseError);
      throw new Error(`Respuesta inválida del servidor: ${responseText.substring(0, 100)}`);
    }
    
    logResponse(url, response.status, data, responseTime);
    
    // Validar que la respuesta tiene la estructura esperada
    if (!data || typeof data !== 'object') {
      throw new Error("Respuesta del servidor no es un objeto válido");
    }
    
    if (!data.reply) {
      throw new Error("La respuesta no contiene el campo 'reply'");
    }
    
    if (typeof data.reply !== 'string') {
      throw new Error("El campo 'reply' no es un string válido");
    }
    
    return data.reply;
    
  } catch (error: any) {
    // Si es un error que ya manejamos, re-lanzarlo
    if (error.message && !error.name) {
      throw error;
    }
    
    // Manejar errores de red
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      logError("Network", error);
      throw new Error(`Error de conexión: Verifica que el servidor esté ejecutándose en ${BASE}`);
    }
    
    if (error.name === 'AbortError') {
      throw new Error("La petición fue cancelada");
    }
    
    // Error genérico
    logError("askIA", error);
    throw new Error(error.message || "Error desconocido al conectar con el servidor");
  }
}

export async function streamIA(
  messages: { role: APIRole; content: string }[],
  onToken: (chunk: string) => void
): Promise<void> {
  const url = `${BASE}/api/chat/stream`;
  const startTime = Date.now();
  
  logRequest(url, "POST", { messages });

  try {
    // Validar entrada
    if (!messages || messages.length === 0) {
      throw new Error("No messages provided");
    }

    // Validar callback
    if (typeof onToken !== 'function') {
      throw new Error("onToken must be a function");
    }

    const response = await fetch(url, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "text/plain",
      },
      body: JSON.stringify({ messages }),
      mode: 'cors',
      credentials: 'omit',
    });
    
    if (!response.ok) {
      const responseTime = Date.now() - startTime;
      const errorText = await response.text();
      logResponse(url, response.status, errorText, responseTime);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    if (!response.body) {
      throw new Error("No response body for streaming");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";
    let tokenCount = 0;

    console.log("📡 Starting stream...");

    try {
      while (true) {
        const { value, done } = await reader.read();
        
        if (done) {
          console.log("✅ Stream completed naturally");
          break;
        }
        
        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          
          if (trimmed === "[DONE]") {
            const responseTime = Date.now() - startTime;
            console.log(`🏁 Stream done signal received. Total tokens: ${tokenCount}, Time: ${responseTime}ms`);
            return;
          }
          
          console.log("🔤 Token received:", trimmed);
          tokenCount++;
          onToken(trimmed);
        }
      }
    } finally {
      reader.releaseLock();
    }
    
  } catch (error: any) {
    // Manejar errores de red
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      logError("Network (Stream)", error);
      throw new Error(`Error de conexión en streaming: Verifica que el servidor esté ejecutándose en ${BASE}`);
    }
    
    if (error.name === 'AbortError') {
      throw new Error("El streaming fue cancelado");
    }
    
    // Error genérico
    logError("streamIA", error);
    throw new Error(error.message || "Error desconocido en el streaming");
  }
}

// Helper para probar la conectividad
export async function testConnection(): Promise<{connected: boolean, details: any}> {
  const url = `${BASE}/api/chat/health`;
  
  try {
    console.log("🏥 Testing connection to:", url);
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
      mode: 'cors',
      credentials: 'omit'
    });
    
    const data = await response.json();
    
    const result = {
      connected: response.ok,
      details: {
        status: response.status,
        data: data,
        url: url,
        timestamp: new Date().toISOString()
      }
    };
    
    console.log("🏥 Health check result:", result);
    return result;
    
  } catch (error: any) {
    console.error("🚨 Connection test failed:", error);
    return {
      connected: false,
      details: {
        error: error.message,
        url: url,
        timestamp: new Date().toISOString()
      }
    };
  }
}

// Helper para obtener información del entorno
export function getEnvironmentInfo() {
  return {
    baseUrl: BASE,
    origin: window.location.origin,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    env: import.meta.env.MODE
  };
}