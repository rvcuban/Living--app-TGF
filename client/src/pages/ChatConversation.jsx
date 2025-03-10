// src/pages/ChatConversation.jsx
import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaPaperPlane, FaCircle } from 'react-icons/fa';
import api from '../utils/apiFetch';

// We'll implement our own date formatting to avoid the dependency issue
const formatTime = (timestamp) => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return '';
  }
};

const formatDate = (timestamp) => {
  try {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString([], { day: 'numeric', month: 'long' });
    }
  } catch (e) {
    return '';
  }
};

export default function ChatConversation() {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);

  const [messages, setMessages] = useState([]);
  const [msgContent, setMsgContent] = useState('');
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const messageAreaRef = useRef(null);

  // Mark messages as read when entering the chat
  useEffect(() => {
    if (!currentUser || !conversationId) return;

    const markMessagesAsRead = async () => {
      try {
        await api.post(`/chat/read/${conversationId}`);
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    };

    markMessagesAsRead();
  }, [conversationId, currentUser]);

  // Socket connection
  useEffect(() => {
    if (!currentUser || !conversationId) return;

    socketRef.current = io({
      auth: {
        userId: currentUser._id,
        userName: currentUser.username,
      },
    });

    socketRef.current.emit('joinRoom', conversationId);

    socketRef.current.on('chat message', (newMsg) => {
      // Mark incoming messages as read immediately
      if (newMsg.user && newMsg.user._id !== currentUser._id) {
        api.post(`/chat/read/${conversationId}`).catch(console.error);
      }

      // Add message, preventing duplicates
      setMessages(prev => {
        const isDuplicate = prev.some(
          msg => msg._id === newMsg._id ||
            (msg.content === newMsg.content &&
              msg.user && newMsg.user &&
              msg.user._id === newMsg.user._id &&
              Math.abs(new Date(msg.createdAt).getTime() - new Date(newMsg.createdAt).getTime()) < 2000)
        );

        return isDuplicate ? prev : [...prev, newMsg];
      });
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [currentUser, conversationId]);

  // Get partner info
  useEffect(() => {
    if (!currentUser || !conversationId || !conversationId.includes('_')) return;

    const ids = conversationId.split('_');
    const partnerId = ids.find(id => id !== String(currentUser._id));

    if (partnerId) {
      api.get(`/user/${partnerId}`)
        .then(res => {
          setPartner(res.data);
        })
        .catch(error => {
          console.error('Error fetching partner info:', error);
        });
    }
  }, [currentUser, conversationId]);

  // Load existing messages
  useEffect(() => {
    if (!currentUser || !conversationId) return;

    setLoading(true);

    api.get(`/chat/messages/${conversationId}`)
      .then(res => {
        const data = res.data;
        if (data.success && Array.isArray(data.messages)) {
          setMessages(data.messages);
        } else {
          toast.error('Error al cargar mensajes');
        }
      })
      .catch(error => {
        console.error('Error fetching messages:', error);
        toast.error('Error al cargar mensajes');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [conversationId, currentUser]);

  // Auto-scroll to bottom
  useEffect(() => {
    // Small delay to ensure DOM is updated
    const timer = setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);

    return () => clearTimeout(timer);
  }, [messages]);

  // Group messages by date
  const groupedMessages = () => {
    const groups = {};
    messages.forEach(msg => {
      const date = msg.createdAt ? formatDate(msg.createdAt) : 'Sin fecha';
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!msgContent.trim() || !currentUser || sending) return;

    const trimmedContent = msgContent.trim();
    setSending(true);
    setMsgContent('');

    const newMsg = {
      content: trimmedContent,
      userId: currentUser._id,
      userName: currentUser.username,
      roomId: conversationId
    };

    // Optimistic update with temporary ID
    const tempId = `temp-${Date.now()}`;
    setMessages(prev => [
      ...prev,
      {
        ...newMsg,
        user: { _id: currentUser._id, username: currentUser.username },
        createdAt: new Date().toISOString(),
        _id: tempId,
        sending: true
      }
    ]);

    try {
      // Send via socket
      if (socketRef.current) {
        socketRef.current.emit('chat message', newMsg);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error al enviar el mensaje');

      // Remove failed message
      setMessages(prev => prev.filter(m => m._id !== tempId));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto sm:my-4 sm:shadow-lg sm:rounded-lg">
      {/* Fixed Header */}
      <header className="sticky top-0 z-10 flex items-center p-4 border-b bg-white sm:rounded-t-lg shadow-sm">
        <button
          onClick={() => navigate('/chat')}
          className="mr-3 text-pink-500 hover:text-pink-700 transition-colors"
          aria-label="Volver a la lista de chats"
        >
          <FaArrowLeft size={20} />
        </button>

        {partner ? (
          <div className="flex items-center">
            <div className="relative mr-3">
              <img
                src={partner.avatar || '/default-avatar.png'}
                alt={partner.username}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
            </div>
            <div>
              <h2 className="text-lg font-bold">{partner.username}</h2>

            </div>
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse mr-3"></div>
            <div className="flex flex-col">
              <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
            </div>
          </div>
        )}
      </header>

      {/* Messages Area */}
      <main
        ref={messageAreaRef}
        className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col space-y-2"
      >
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Cargando mensajes...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
              <FaPaperPlane className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-500">No hay mensajes aún</p>
            <p className="text-gray-400 text-sm">¡Envía el primer mensaje!</p>
          </div>
        ) : (
          Object.entries(groupedMessages()).map(([date, msgs]) => (
            <div key={date} className="space-y-2">
              <div className="flex justify-center my-3">
                <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                  {date}
                </span>
              </div>

              {msgs.map(m => {
                const isMine = m.user && m.user._id === currentUser._id;
                return (
                  <div
                    key={m._id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'} items-end space-x-2`}
                  >
                    {!isMine && (
                      <img
                        src={partner?.avatar || '/default-avatar.png'}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      />
                    )}

                    <div className={`relative max-w-[70%] p-3 rounded-2xl 
                      ${isMine
                        ? 'bg-blue-500 text-white rounded-br-none'
                        : 'bg-white text-gray-800 shadow-sm rounded-bl-none'}`
                    }>
                      <p className="text-sm whitespace-pre-wrap">{m.content}</p>

                      <div className={`flex items-center text-xs mt-1 
                        ${isMine ? 'text-pink-200' : 'text-gray-500'}`}
                      >
                        {formatTime(m.createdAt)}

                        {/* Show sending status for outgoing messages */}
                        {isMine && (
                          <span className="ml-1">
                            <span>✓</span> {/* Always show check mark regardless of send status */}
                          </span>
                        )}
                      </div>
                    </div>

                    {isMine && (
                      <div className="w-8 h-8 flex-shrink-0"></div> // Spacing placeholder
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </main>

      {/* Fixed Message Input */}
      <form
        onSubmit={handleSend}
        className="sticky bottom-0 z-10 p-4 border-t flex items-center bg-white shadow-md"
      >
        <input
          type="text"
          className="flex-1 border rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          placeholder="Escribe un mensaje..."
          value={msgContent}
          onChange={e => setMsgContent(e.target.value)}
          disabled={sending}
        />
        <button
          type="submit"
          className={`ml-3 bg-pink-500 text-white p-2.5 rounded-full hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 flex items-center justify-center
            ${(!msgContent.trim() || sending) ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!msgContent.trim() || sending}
        >
          {sending ? (
            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : (
            <FaPaperPlane size={16} />
          )}
        </button>
      </form>
    </div>
  );
}