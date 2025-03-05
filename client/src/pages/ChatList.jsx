// src/pages/ChatList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export default function ChatList() {
  const [conversations, setConversations] = useState([]);
  const { currentUser } = useSelector(state => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) return;
    const fetchConversations = async () => {
      try {
        const res = await fetch('/api/chat/conversations', {
          headers: { Authorization: `Bearer ${currentUser.token}` },
        });
        const data = await res.json();
        if (data.success && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
        } else {
          console.error('La respuesta del backend no es válida:', data);
          setConversations([]);
        }
      } catch (error) {
        console.error('Error al cargar las conversaciones:', error);
        setConversations([]);
      }
    };

    fetchConversations();
  }, [currentUser]);

  const handleSelectConversation = (conv) => {
    navigate(`/chat/${conv.conversationId}`);
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto sm:my-4 sm:shadow-lg sm:rounded-lg">
      <h1 className="flex items-center p-3 border-b bg-white sm:rounded-t-lg text-2xl font-bold mb-4">Mis Chats</h1>
      {conversations.length > 0 ? (
        <ul className="space-y-2">
          {conversations.map(conv => (
            <li
              key={conv.conversationId}
              onClick={() => handleSelectConversation(conv)}
              className="p-3 border rounded cursor-pointer hover:bg-gray-100 flex items-center relative"
            >
              <img
                src={conv.avatar || 'default-avatar.png'}
                alt={conv.username}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div>
                <p className="font-semibold">{conv.username}</p>
                {conv.lastMessage && (
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                )}
              </div>
              {conv.unreadCount > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {conv.unreadCount}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No hay conversaciones disponibles.</p>
      )}
    </div>
  );
}