import React, { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';

export default function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [msgContent, setMsgContent] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { currentUser } = useSelector((state) => state.user);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const otherUserId = searchParams.get('otherUserId');
  const conversationIdParam = searchParams.get('conversationId');
  const prefilled = searchParams.get('prefilled') || '';

  // Actualizar isMobile en resize
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // EFFECT 1: Conectar al socket y configurar recepción de mensajes
  useEffect(() => {
    if (!currentUser) return;

    socketRef.current = io('http://localhost:5000', {
      auth: {
        userId: currentUser._id,
        userName: currentUser.username,
      },
    });

    socketRef.current.on('chat message', (newMsg) => {
      if (
        selectedConversation &&
        newMsg.conversationId === selectedConversation.conversationId
      ) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [currentUser, selectedConversation?.conversationId]);

  // EFFECT 2: Cargar conversaciones desde el backend
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/chat/conversations', {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const data = await res.json();
        if (data && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
        } else {
          console.error('La respuesta del backend no contiene un array de conversaciones:', data);
          setConversations([]);
        }
      } catch (error) {
        console.error('Error al cargar las conversaciones:', error);
        setConversations([]);
      }
    };

    fetchConversations();
  }, [currentUser]);

  // EFFECT 3: Si se recibe otherUserId en la URL y no hay conversationId, iniciar conversación
  useEffect(() => {
    if (otherUserId && !conversationIdParam && currentUser) {
      const startConversation = async () => {
        try {
          const res = await fetch('/api/chat/start', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUser.token}`,
            },
            body: JSON.stringify({
              receiverId: otherUserId,
              content: prefilled.trim(),
            }),
          });
          const data = await res.json();
          if (data.success) {
            // Actualizar la URL con el conversationId
            navigate(
              `/chat?otherUserId=${otherUserId}&conversationId=${data.conversationId}&prefilled=${encodeURIComponent(prefilled)}`
            );
          } else {
            toast.error(data.message || 'Error al iniciar la conversación.');
          }
        } catch (error) {
          toast.error(error.message);
        }
      };
      startConversation();
    }
  }, [otherUserId, conversationIdParam, currentUser, prefilled, navigate]);

  // EFFECT 4: Auto-seleccionar conversación si existe en la lista
  useEffect(() => {
    if (otherUserId && conversations.length > 0) {
      const conv = conversations.find((c) => c.userId === otherUserId);
      if (conv) {
        handleSelectConversation(conv);
      }
    }
  }, [otherUserId, conversations]);

  // EFFECT 5: Hacer scroll al final de los mensajes cuando se actualizan
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Función para seleccionar una conversación y cargar sus mensajes
  const handleSelectConversation = useCallback(
    async (conv) => {
      setSelectedConversation(conv);
      if (socketRef.current) {
        socketRef.current.emit('joinRoom', conv.conversationId);
      }
      try {
        const res = await fetch(`/api/chat/messages/${conv.conversationId}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const data = await res.json();
        if (data && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          console.error('La respuesta de mensajes no tiene el formato correcto:', data);
          setMessages([]);
        }
      } catch (error) {
        toast.error('Error al cargar mensajes');
      }
    },
    [currentUser]
  );

  // Función para enviar mensaje
  const handleSend = (e) => {
    e.preventDefault();
    if (!msgContent.trim() || !selectedConversation) return;
    const newMsg = {
      _id: Date.now().toString(),
      content: msgContent,
      conversationId: selectedConversation.conversationId,
      user: currentUser._id,
      createdAt: new Date().toISOString(),
    };
    if (socketRef.current) {
      socketRef.current.emit('chat message', newMsg);
    }
    setMessages((prev) => [...prev, newMsg]);
    setMsgContent('');
  };

  // Para móviles: Si no hay conversación seleccionada, mostrar la lista
  const renderConversationList = () => (
    <div className="w-full h-full">
      <div className="p-3 bg-gray-100 font-semibold">Mis Chats</div>
      <ul className="overflow-y-auto">
        {conversations.length > 0 ? (
          conversations.map((conv) => (
            <li
              key={conv.userId}
              onClick={() => handleSelectConversation(conv)}
              className={`p-3 cursor-pointer hover:bg-gray-200 flex items-center ${
                selectedConversation?.userId === conv.userId ? 'bg-gray-200' : ''
              }`}
            >
              <Link to={`/public-profile/${conv.userId}`}>
                <img
                  src={conv.avatar || 'default-avatar.png'}
                  alt={conv.username}
                  className="w-10 h-10 rounded-full mr-3"
                />
              </Link>
              <p className="font-medium text-gray-800">{conv.username}</p>
            </li>
          ))
        ) : (
          <p className="p-3 text-gray-500">No hay conversaciones disponibles.</p>
        )}
      </ul>
    </div>
  );

  // Para móviles: Vista de chat con botón para volver a la lista
  const renderChatScreen = () => (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b flex items-center">
        <button
          onClick={() => setSelectedConversation(null)}
          className="mr-3 text-blue-500"
        >
          ←
        </button>
        <h2 className="text-lg font-bold">
          Chat con{' '}
          <Link to={`/public-profile/${selectedConversation.userId}`} className="text-blue-600 hover:underline">
            {selectedConversation.username}
          </Link>
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((m) => {
          const isMine = m.user === currentUser._id;
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
                <p className="text-xs mb-1 font-semibold">
                  {isMine ? 'Tú' : m.user.username || 'Anónimo'}
                </p>
                <p className="text-sm">{m.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="border-t p-3 flex items-center bg-white">
        <input
          type="text"
          className="flex-1 border rounded-full px-3 py-2 text-sm mr-2 focus:outline-none"
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
    </div>
  );

  // Vista en pantallas grandes: Layout de dos columnas
  const renderDesktopChat = () => (
    <div className="flex w-full mt-4 max-w-5xl mx-auto h-[80vh] border border-gray-300 rounded-md bg-white overflow-hidden">
      {/* Panel Izquierdo: Lista de Conversaciones */}
      <aside className="w-1/3 border-r border-gray-300 flex flex-col">
        <div className="p-3 bg-gray-100 font-semibold">Mis Chats</div>
        <ul className="flex-1 overflow-y-auto">
          {conversations.length > 0 ? (
            conversations.map((conv) => (
              <li
                key={conv.userId}
                onClick={() => handleSelectConversation(conv)}
                className={`p-3 cursor-pointer hover:bg-gray-200 flex items-center ${
                  selectedConversation?.userId === conv.userId ? 'bg-gray-200' : ''
                }`}
              >
                <Link to={`/public-profile/${conv.userId}`}>
                  <img
                    src={conv.avatar || 'default-avatar.png'}
                    alt={conv.username}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                </Link>
                <p className="font-medium text-gray-800">{conv.username}</p>
              </li>
            ))
          ) : (
            <p className="p-3 text-gray-500">No hay conversaciones disponibles.</p>
          )}
        </ul>
      </aside>

      {/* Panel Derecho: Chat Activo */}
      <main className="flex-1 flex flex-col">
        <div className="p-3 border-b">
          {selectedConversation ? (
            <h2 className="text-lg font-bold">
              Chat con{' '}
              <Link to={`/public-profile/${selectedConversation.userId}`} className="text-blue-600 hover:underline">
                {selectedConversation.username}
              </Link>
            </h2>
          ) : (
            <p className="text-gray-400">Selecciona una conversación</p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {messages.map((m) => {
            const isMine = m.user === currentUser._id;
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
                  <p className="text-xs mb-1 font-semibold">
                    {isMine ? 'Tú' : m.user.username || 'Anónimo'}
                  </p>
                  <p className="text-sm">{m.content}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <form onSubmit={handleSend} className="border-t p-3 flex items-center bg-white">
          <input
            type="text"
            className="flex-1 border rounded-full px-3 py-2 text-sm mr-2 focus:outline-none"
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

  return (
    <div>
      {isMobile ? (
        // En móviles: Si no se ha seleccionado una conversación, mostrar la lista; de lo contrario, el chat
        selectedConversation ? renderChatScreen() : renderConversationList()
      ) : (
        renderDesktopChat()
      )}
    </div>
  );
}
