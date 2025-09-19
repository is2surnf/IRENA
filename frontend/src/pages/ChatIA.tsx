// import { useState } from "react";

// interface Message {
//   sender: "user" | "bot";
//   text: string;
// }

// const ChatIA = () => {
//   const [messages, setMessages] = useState<Message[]>([
//     { sender: "bot", text: "¡Bienvenido! Soy tu asistente químico. ¿En qué puedo ayudarte hoy?" }
//   ]);
//   const [input, setInput] = useState("");

//   const sendMessage = async () => {
//     if (!input.trim()) return;

//     // Añadir mensaje del usuario al chat
//     const newMessage: Message = { sender: "user", text: input };
//     setMessages([...messages, newMessage]);

//     try {
//       const response = await fetch("http://localhost:8000/chat", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ message: input }),
//       });

//       const data = await response.json();
//       const botMessage: Message = { sender: "bot", text: data.reply };
//       setMessages((prev) => [...prev, botMessage]);
//     } catch (error) {
//       setMessages((prev) => [...prev, { sender: "bot", text: "Error al conectarse con el servidor." }]);
//     }

//     setInput("");
//   };

//   return (
//     <div className="flex flex-col h-screen bg-[#0e1525] p-6 rounded-xl">
//       <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-[#0b1120] rounded-lg">
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`p-3 rounded-lg max-w-md ${
//               msg.sender === "user"
//                 ? "ml-auto bg-cyan-600 text-white"
//                 : "mr-auto bg-gray-700 text-gray-200"
//             }`}
//           >
//             {msg.text}
//           </div>
//         ))}
//       </div>

//       <div className="flex mt-4">
//         <input
//           type="text"
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           className="flex-1 p-3 rounded-l-lg bg-gray-800 text-white outline-none"
//           placeholder="Escribe tu consulta..."
//         />
//         <button
//           onClick={sendMessage}
//           className="bg-cyan-500 px-4 rounded-r-lg text-white hover:bg-cyan-600"
//         >
//           Enviar
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatIA;
