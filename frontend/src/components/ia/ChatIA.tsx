// src/components/ia/ChatIA.tsx
import React, { useEffect, useRef, useState } from "react";
import MessageBubble from './MessageBubble';
import type { ChatMessage } from './MessageBubble';
import useIAChat from "../../hooks/useIAChat";

const ChatIA: React.FC = () => {
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    error, 
    connectionStatus,
    clearChat,
    retryConnection,
    getChatStats,
    isConnected,
    canSendMessage
  } = useIAChat();
  
  const [input, setInput] = useState("");
  const [showStats, setShowStats] = useState(false);
  const viewRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll cuando llegan nuevos mensajes
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.scrollTo({ 
        top: viewRef.current.scrollHeight, 
        behavior: "smooth" 
      });
    }
  }, [messages, isLoading]);

  // Manejar envío de mensaje
  const onSend = async () => {
    const text = input.trim();
    if (!text || !canSendMessage) return;
    
    setInput("");
    await sendMessage(text);
  };

  // Manejar teclas en el textarea
  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  // Sugerencias rápidas
  const quickSuggestions = [
    "Explica el equilibrio químico con un ejemplo",
    "Balancea: C3H8 + O2 → CO2 + H2O",
    "Dame 3 ejercicios de estequiometría con solución",
    "Precauciones para manejar ácido clorhídrico",
  ];

  // Obtener color del estado de conexión
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-emerald-300 bg-emerald-800/20 border-emerald-700/30';
      case 'checking': return 'text-yellow-300 bg-yellow-800/20 border-yellow-700/30';
      case 'disconnected': return 'text-orange-300 bg-orange-800/20 border-orange-700/30';
      case 'error': return 'text-red-300 bg-red-800/20 border-red-700/30';
      default: return 'text-slate-300 bg-slate-800/20 border-slate-700/30';
    }
  };

  // Obtener texto del estado de conexión
  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'En línea';
      case 'checking': return 'Conectando...';
      case 'disconnected': return 'Desconectado';
      case 'error': return 'Error';
      default: return 'Desconocido';
    }
  };

  return (
    <section className="bg-[#0b1220] border border-[#101a32] rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <header className="bg-[#0e1525] px-5 py-4 border-b border-[#101a32] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full grid place-items-center bg-cyan-900/30 border border-cyan-600/30">
            <span className="text-cyan-300 text-lg">🧪</span>
          </div>
          <div>
            <h2 className="text-slate-100 font-semibold">Asistente Químico</h2>
            <p className="text-xs text-slate-400">Consultas científicas y de laboratorio</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Estado de conexión */}
          <span className={`text-xs px-2 py-1 rounded border ${getConnectionStatusColor()}`}>
            {getConnectionStatusText()}
          </span>
          
          {/* Botones de acción */}
          <div className="flex items-center gap-1">
            {/* Botón de estadísticas */}
            <button
              onClick={() => setShowStats(!showStats)}
              className="h-8 w-8 rounded-lg bg-slate-700/40 border border-white/10 hover:bg-slate-700/60 text-slate-300 text-xs grid place-items-center"
              title="Estadísticas"
            >
              📊
            </button>
            
            {/* Botón de limpiar chat */}
            <button
              onClick={clearChat}
              className="h-8 w-8 rounded-lg bg-slate-700/40 border border-white/10 hover:bg-slate-700/60 text-slate-300 text-xs grid place-items-center"
              title="Limpiar chat"
            >
              🗑️
            </button>
            
            {/* Botón de reconexión (solo si desconectado) */}
            {(connectionStatus === 'disconnected' || connectionStatus === 'error') && (
              <button
                onClick={retryConnection}
                className="h-8 w-8 rounded-lg bg-orange-600/40 border border-orange-500/30 hover:bg-orange-600/60 text-orange-300 text-xs grid place-items-center"
                title="Reintentar conexión"
              >
                🔄
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Panel de estadísticas (opcional) */}
      {showStats && (
        <div className="bg-[#0f172a] border-b border-[#101a32] px-5 py-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {(() => {
              const stats = getChatStats();
              return (
                <>
                  <div className="text-center">
                    <div className="text-slate-400">Mensajes</div>
                    <div className="text-slate-200 font-semibold">{stats.totalMessages}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400">Usuario</div>
                    <div className="text-blue-300 font-semibold">{stats.userMessages}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400">IA</div>
                    <div className="text-cyan-300 font-semibold">{stats.assistantMessages}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-slate-400">Caracteres</div>
                    <div className="text-slate-200 font-semibold">{stats.totalCharacters.toLocaleString()}</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Historial de mensajes */}
      <div ref={viewRef} className="h-[60vh] md:h-[62vh] overflow-y-auto px-5 py-4 space-y-1">
        {messages.map((m: ChatMessage) => (
          <MessageBubble key={m.id} msg={m} />
        ))}

        {/* Indicador de carga */}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-300/70 text-sm py-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span>El asistente está escribiendo...</span>
          </div>
        )}

        {/* Mostrar errores */}
        {error && (
          <div className="bg-rose-900/20 border border-rose-800/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-rose-300 text-lg">⚠️</span>
              <div>
                <div className="text-rose-300 font-medium text-sm">
                  {error.type === 'connection' ? 'Error de Conexión' : 
                   error.type === 'api' ? 'Error de API' : 
                   error.type === 'validation' ? 'Error de Validación' : 
                   'Error Desconocido'}
                </div>
                <div className="text-rose-200/90 text-sm mt-1">
                  {error.message}
                </div>
                <div className="text-rose-400/60 text-xs mt-2">
                  {new Date(error.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input de mensaje */}
      <footer className="p-4 bg-[#0e1525] border-t border-[#101a32]">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={
                !isConnected ? "Conectando con el servidor..." :
                isLoading ? "Esperando respuesta..." :
                "Escribe tu consulta (Enter para enviar, Shift+Enter para salto)…"
              }
              disabled={!canSendMessage}
              className="flex-1 resize-none h-12 max-h-36 rounded-xl bg-[#0b1324] border border-white/10 focus:border-cyan-500/60 outline-none text-slate-100 px-3 py-2 placeholder:text-slate-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={onSend}
              disabled={!canSendMessage || !input.trim()}
              className="h-12 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title="Enviar (Enter)"
            >
              ➤
            </button>
          </div>

          {/* Sugerencias rápidas */}
          {isConnected && (
            <div className="flex flex-wrap gap-2 text-xs">
              {quickSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  disabled={isLoading}
                  className="px-2 py-1 rounded-lg bg-[#0b1324] text-slate-300 border border-white/10 hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          {/* Información de estado en el footer */}
          {!isConnected && (
            <div className="text-center text-xs text-slate-400">
              {connectionStatus === 'checking' ? (
                "🔄 Verificando conexión..."
              ) : (
                "⚠️ Sin conexión al servidor. Verifica que esté ejecutándose en http://localhost:8000"
              )}
            </div>
          )}
        </div>
      </footer>
    </section>
  );
};

export default ChatIA;