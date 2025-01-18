// src/pages/Chat.jsx
import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export default function Chat() {
  const [conversations, setConversations] = useState([]); // lista de chats o usuarios
  const [selectedConversation, setSelectedConversation] = useState(null); // el chat activo
  const [messages, setMessages] = useState([]); // mensajes del chat activo
  const [msgContent, setMsgContent] = useState('');

  const { currentUser } = useSelector((state) => state.user);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // 1. Conectar Socket y buscar "lista de conversaciones"
  useEffect(() => {
    if (!currentUser) return;

    // Conectamos con Socket.io
    socketRef.current = io('http://localhost:5000', {
      auth: {
        userId: currentUser._id,
        userName: currentUser.username
      }
    });

    // EJEMPLO: Simulamos que al conectarnos recibimos la lista
    // de conversaciones con sus "userId" y "username"
    // En un caso real, harías una llamada fetch a tu backend:
    // fetch('/api/chat/conversations')...
    const fakeConvList = [
      { userId: '123', username: 'Alice' },
      { userId: '456', username: 'Bob' },
      { userId: '999', username: 'Carlos' },
    ];
    setConversations(fakeConvList);

    // Escuchar mensajes entrantes para la conversación actual
    socketRef.current.on('chat message', (newMsg) => {
      // Si el mensaje es para la conversación activa, lo agregamos
      // (En un proyecto real, harías un check con newMsg.roomId o algo similar)
      if (newMsg.conversationId === selectedConversation?.userId) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [currentUser, selectedConversation?.userId]);

  // 2. Hacer scroll al final cada vez que entren mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Al hacer clic en una conversación, cambiamos el "chat activo"
  // y cargamos sus mensajes (falso fetch + ejemplo).
  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv);

    // En un caso real, fetch a /api/chat/messages?convId=conv.userId
    // O usar socketRef.current.emit('joinRoom', conv.userId), etc.
    // Ejemplo rápido de "falsos" mensajes:
    const fakeMessages = [
      {
        _id: 'abc1',
        content: `Hola, soy ${conv.username}`,
        user: conv.username,
        conversationId: conv.userId
      },
      {
        _id: 'abc2',
        content: '¡Encantado de hablar contigo!',
        user: currentUser.username,
        conversationId: conv.userId
      }
    ];
    setMessages(fakeMessages);
  };

  // Enviar mensaje
  const handleSend = (e) => {
    e.preventDefault();
    if (!msgContent.trim()) return;

    if (!currentUser) {
      toast.error('Debes iniciar sesión para enviar mensajes');
      return;
    }
    if (!selectedConversation) {
      toast.warn('Selecciona una conversación primero');
      return;
    }

    // Emitir el mensaje al socket con "conversationId" 
    // (o "roomId") para saber a quién va
    const newMsgObj = {
      _id: Date.now().toString(), // algo temporal
      content: msgContent,
      user: currentUser.username,
      conversationId: selectedConversation.userId
    };
    socketRef.current.emit('chat message', newMsgObj);

    // Lo agregamos también a "messages" local
    setMessages((prev) => [...prev, newMsgObj]);
    setMsgContent('');
  };

  return (
    <div className="flex w-full mt-4 max-w-5xl mx-auto h-[80vh] border border-gray-300 rounded-md bg-white overflow-hidden">
      {/* Panel Izquierdo: Lista de Conversaciones/Usuarios */}
      <aside className="w-1/3 border-r border-gray-300 flex flex-col">
        <div className="p-3 bg-gray-100 font-semibold">Mis Chats</div>
        <ul className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <li
              key={conv.userId}
              className={`p-3 cursor-pointer hover:bg-gray-200 ${
                selectedConversation?.userId === conv.userId ? 'bg-gray-200' : ''
              }`}
              onClick={() => handleSelectConversation(conv)}
            >
              <p className="font-medium text-gray-800">{conv.username}</p>
              {/* Podrías mostrar un último mensaje, etc. */}
            </li>
          ))}
        </ul>
      </aside>

      {/* Panel Derecho: Mensajes del Chat Seleccionado */}
      <main className="flex-1 flex flex-col">
        {/* Cabecera del chat: nombre del contacto */}
        <div className="p-3 border-b">
          {selectedConversation ? (
            <h2 className="text-lg font-bold">
              Chat con {selectedConversation.username}
            </h2>
          ) : (
            <p className="text-gray-400">Selecciona una conversación</p>
          )}
        </div>

        {/* Lista de mensajes */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map((m) => {
            const isMine = m.user === currentUser?.username;
            return (
              <div
                key={m._id}
                className={`mb-2 flex ${isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[60%] p-2 rounded-xl ${
                    isMine ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-xs mb-1 font-semibold">{m.user}</p>
                  <p className="text-sm leading-snug">{m.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input para enviar mensaje */}
        <form onSubmit={handleSend} className="border-t p-3 flex items-center bg-white">
          <input
            className="flex-1 border rounded-full px-3 py-2 text-sm mr-2 focus:outline-none"
            type="text"
            placeholder="Escribe un mensaje..."
            value={msgContent}
            onChange={(e) => setMsgContent(e.target.value)}
          />
          <button
            type="submit"
            className="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600 transition-all"
          >
            Enviar
          </button>
        </form>
      </main>
    </div>
  );
}
