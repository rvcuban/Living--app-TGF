// src/pages/ChatConversation.jsx
import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaStar } from 'react-icons/fa';

export default function ChatConversation() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);

  const [messages, setMessages] = useState([]);
  const [msgContent, setMsgContent] = useState('');
  const [partner, setPartner] = useState(null);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // Conectarse al socket y unirse a la sala (conversationId)
  // Conectarse al socket y unirse a la sala (conversationId)
  useEffect(() => {
    if (!currentUser || !conversationId) return;

    // Make sure socketRef is properly initialized
    socketRef.current = io({
      auth: {
        userId: currentUser._id,
        userName: currentUser.username,
      },
    });

    socketRef.current.emit('joinRoom', conversationId);

    socketRef.current.on('chat message', (newMsg) => {
      setMessages(prev => [...prev, newMsg]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [currentUser, conversationId]);

  // Obtener información del partner a partir del conversationId
  useEffect(() => {
    if (!currentUser || !conversationId || !conversationId.includes('_')) return;
    const ids = conversationId.split('_');
    const partnerId = ids.find(id => id !== String(currentUser._id));
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
        console.log(`Fetching messages for conversation: ${conversationId}`);
        const res = await fetch(`/api/chat/messages/${conversationId}`, {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const data = await res.json();
        console.log('Messages response:', data);
        
        if (data.success && Array.isArray(data.messages)) {
          console.log(`Loaded ${data.messages.length} messages`);
          setMessages(data.messages);
        } else {
          toast.error('Error al cargar mensajes');
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Error al cargar mensajes');
      }
    };
    fetchMessages();
  }, [conversationId, currentUser]);

  // Scroll automático al final de los mensajes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enviar mensaje (usamos claves "user" y "conversationId")
  const handleSend = (e) => {
    e.preventDefault();
    if (!msgContent.trim() || !currentUser) return;
    
    // Make sure userId is explicitly included
    const newMsg = {
      content: msgContent.trim(),
      userId: currentUser._id,
      userName: currentUser.username,
      roomId: conversationId
    };
    
    console.log("Sending message:", newMsg); // Add this debugging line
    
    if (socketRef.current) {
      socketRef.current.emit('chat message', newMsg);
    }
    
    setMessages(prev => [
      ...prev,
      {
        ...newMsg,
        user: { _id: currentUser._id, username: currentUser.username },
        createdAt: new Date().toISOString(),
        _id: Date.now().toString(),
      }
    ]);
    setMsgContent('');
  };


  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto sm:my-4 sm:shadow-lg sm:rounded-lg relative">
      {/* Cabecera: botón para volver y nombre del partner */}
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
      {/* Área de mensajes (scrollable) */}
      <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map(m => {
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
      {/* Formulario de envío fijo */}
      <form onSubmit={handleSend} className="sticky bottom-0 z-10 p-3 border-t flex items-center bg-white">
        <input
          type="text"
          className="flex-1 border rounded-full px-3 py-2 mr-2 focus:outline-none"
          placeholder="Escribe un mensaje..."
          value={msgContent}
          onChange={e => setMsgContent(e.target.value)}
        />
        <button type="submit" className="bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600">
          Enviar
        </button>
      </form>
    </div>
  );
}