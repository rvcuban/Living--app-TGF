// src/pages/ChatConversation.jsx
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaStar } from 'react-icons/fa';

export default function ChatConversation() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector((state) => state.user);

  const [messages, setMessages] = useState([]);
  const [msgContent, setMsgContent] = useState('');
  const [partner, setPartner] = useState(null);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // Conectamos al socket y nos unimos a la sala (conversationId)
  useEffect(() => {
    if (!currentUser || !conversationId) return;

    socketRef.current = io('http://localhost:5000', {
      auth: {
        userId: currentUser._id,
        userName: currentUser.username,
      },
    });

    socketRef.current.emit('joinRoom', conversationId);

    socketRef.current.on('chat message', (newMsg) => {
      if (newMsg.conversationId === conversationId) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [currentUser, conversationId]);

  // Obtener información del partner a partir del conversationId
  useEffect(() => {
    if (!currentUser || !conversationId) return;
    const ids = conversationId.split('_');
    const partnerId = ids.find((id) => id !== currentUser._id.toString());
    if (partnerId) {
      const fetchPartner = async () => {
        try {
          const res = await fetch(`/api/user/${partnerId}`, {
            headers: { Authorization: `Bearer ${currentUser.token}` },
          });
          const data = await res.json();
          if (data) setPartner(data);
        } catch (error) {
          console.error('Error fetching partner info:', error);
        }
      };
      fetchPartner();
    }
  }, [currentUser, conversationId]);

  // Cargar mensajes existentes
  useEffect(() => {
    if (!currentUser || !conversationId) return;
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/messages/${conversationId}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          toast.error('Error al cargar mensajes');
        }
      } catch (error) {
        toast.error('Error al cargar mensajes');
      }
    };
    fetchMessages();
  }, [conversationId, currentUser]);

  // Scroll automático al final de los mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enviar mensaje
  const handleSend = (e) => {
    e.preventDefault();
    if (!msgContent.trim()) return;
    const newMsg = {
      // No necesitamos enviar _id (el backend lo asignará)
      content: msgContent.trim(),
      // Enviamos el ID del usuario actual como userId
      userId: currentUser._id,
      // Y el conversationId (que es el room al que nos unimos)
      roomId: conversationId,
    };
    if (socketRef.current) {
      socketRef.current.emit('chat message', newMsg);
    }
    // Actualizamos localmente para mostrar el mensaje inmediatamente
    setMessages((prev) => [
      ...prev,
      {
        ...newMsg,
        user: { _id: currentUser._id, username: currentUser.username },
        createdAt: new Date().toISOString(),
        _id: Date.now().toString(),
      },
    ]);
    setMsgContent('');
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto sm:my-4 sm:shadow-lg sm:rounded-lg">
      {/* Cabecera: Botón de volver y nombre del partner */}
      <header className="flex items-center p-3 border-b bg-white sm:rounded-t-lg">
        <button
          onClick={() => navigate('/chat')}
          className="mr-3 text-blue-500 hover:text-blue-700"
          aria-label="Volver a la lista de chats"
        >
          <FaArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold">
          Chat con {partner ? partner.username : '...'}
        </h2>
      </header>
  
      {/* Área de mensajes */}
      <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((m) => {
          const isMine = m.user && m.user._id === currentUser._id;
          return (
            <div key={m._id} className={`mb-2 flex ${isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[60%] p-2 rounded-xl ${isMine ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-900'}`}>
                <p className="text-xs mb-1 font-semibold">{isMine ? 'Tú' : m.user.username}</p>
                <p className="text-sm">{m.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>
  
      {/* Formulario para enviar mensaje */}
      <form onSubmit={handleSend} className="p-3 border-t flex items-center bg-white sm:rounded-b-lg">
        <input
          type="text"
          className="flex-1 border rounded-full px-3 py-2 mr-2 focus:outline-none"
          placeholder="Escribe un mensaje..."
          value={msgContent}
          onChange={(e) => setMsgContent(e.target.value)}
        />
        <button
          type="submit"
          className="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600"
        >
          Enviar
        </button>
      </form>
    </div>
  );
}
