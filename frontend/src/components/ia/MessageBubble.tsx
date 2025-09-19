// src/components/ia/MessageBubble.tsx
import React from "react";
import ReactMarkdown from "react-markdown";
// Importar 'Components' explícitamente y usar 'Partial<Components>' para el tipado
import type { Components } from "react-markdown"; 
import remarkGfm from "remark-gfm";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
}

interface MessageBubbleProps {
  msg: ChatMessage;
}

// Corregido: Usar Partial<Components> para mayor flexibilidad en el tipado
const markdownComponents: Partial<Components> = {
  a: (props) => (
    <a
      {...props}
      className="text-cyan-300 hover:text-cyan-200 underline"
      target="_blank"
      rel="noopener noreferrer"
    />
  ),
  code: ({ inline, className, children, ...props }) => {
    return inline ? (
      <code
        className="bg-slate-800/50 px-1 py-0.5 rounded text-cyan-300 text-sm"
        {...props}
      >
        {children}
      </code>
    ) : (
      <pre className="bg-[#0b1324] border border-white/10 rounded-lg p-3 text-sm overflow-x-auto">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    );
  },
  table: (props) => (
    <div className="overflow-x-auto">
      <table
        {...props}
        className="min-w-full border-collapse border border-slate-700 text-sm"
      />
    </div>
  ),
  th: (props) => (
    <th
      {...props}
      className="border border-slate-700 bg-slate-800/50 px-2 py-1 text-left font-medium"
    />
  ),
  td: (props) => (
    <td {...props} className="border border-slate-700 px-2 py-1" />
  ),
};

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg }) => {
  const isUser = msg.role === "user";
  const isSystem = msg.role === "system";

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isSystem) {
    return (
      <div className="flex justify-center mb-3">
        <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl px-4 py-2 max-w-md">
          <div className="text-slate-300 text-sm text-center">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {msg.content}
            </ReactMarkdown>
          </div>
          <div className="text-slate-500 text-xs text-center mt-1">
            {formatTime(msg.createdAt)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3 group`}
    >
      <div className="flex items-start gap-3 max-w-[85%] md:max-w-[78%]">
        {!isUser && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-900/30 border border-cyan-600/30 flex-shrink-0 mt-1">
            <span className="text-cyan-300 text-base">🧪</span>
          </div>
        )}

        <div className="flex flex-col">
          <div
            className={[
              "rounded-2xl px-4 py-3 shadow-sm leading-relaxed",
              "prose prose-sm prose-invert max-w-none",
              "prose-pre:bg-[#0b1324] prose-pre:border prose-pre:border-white/10 prose-pre:rounded-lg",
              "prose-code:before:content-[''] prose-code:after:content-['']",
              "prose-code:bg-slate-800/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-cyan-300",
              "prose-blockquote:border-l-cyan-500/50 prose-blockquote:bg-cyan-950/20",
              "prose-table:text-sm prose-th:bg-slate-800/50 prose-td:border-slate-700",
              "prose-strong:text-white prose-em:text-slate-200",
              "prose-h1:text-white prose-h2:text-white prose-h3:text-white",
              "prose-ul:text-slate-100 prose-ol:text-slate-100",
              isUser
                ? "bg-indigo-600/90 text-white rounded-tr-sm self-end"
                : "bg-[#0f172a] text-slate-100 border border-white/10 rounded-tl-sm",
            ].join(" ")}
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {msg.content}
            </ReactMarkdown>
          </div>

          <div
            className={`text-xs text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${
              isUser ? "text-right" : "text-left"
            }`}
          >
            {formatTime(msg.createdAt)}
          </div>
        </div>

        {isUser && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700/40 border border-white/10 flex-shrink-0 mt-1">
            <span className="text-white text-sm">🧑‍🔬</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
