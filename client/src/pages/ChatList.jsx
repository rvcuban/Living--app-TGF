// src/pages/ChatList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import api from '../utils/apiFetch'; // Use our api utility

export default function ChatList() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state
  const { currentUser } = useSelector(state => state.user);
  const navigate = useNavigate();

  // Store conversations in localStorage for quick access
  const cacheConversations = (convs) => {
    localStorage.setItem('cachedConversations', JSON.stringify({
      timestamp: Date.now(),
      data: convs
    }));
  };

  // Get cached conversations (if they exist and are recent)
  const getCachedConversations = () => {
    const cached = localStorage.getItem('cachedConversations');
    if (!cached) return null;
    
    const { timestamp, data } = JSON.parse(cached);
    // Cache valid for 30 seconds - enough time for navigation back from conversation
    if (Date.now() - timestamp < 30000) {
      return data;
    }
    return null;
  };

  useEffect(() => {
    if (!currentUser) return;
    
    const fetchConversations = async () => {
      setLoading(true);
      
      // First check for cached data
      const cachedData = getCachedConversations();
      if (cachedData) {
        setConversations(cachedData);
        setLoading(false);
        
        // Still fetch in background to update cache
        fetchFromAPI();
        return;
      }
      
      // If no cache, fetch normally
      fetchFromAPI();
    };
    
    const fetchFromAPI = async () => {
      try {
        const res = await api.get('/chat/conversations');
        const data = res.data;
        
        if (data.success && Array.isArray(data.conversations)) {
          setConversations(data.conversations);
          cacheConversations(data.conversations);
        } else {
          console.error('La respuesta del backend no es válida:', data);
        }
      } catch (error) {
        console.error('Error al cargar las conversaciones:', error);
        toast.error('No se pudieron cargar las conversaciones');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [currentUser]);

  const handleSelectConversation = (conv) => {
    navigate(`/chat/${conv._id}`);
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto sm:my-4 sm:shadow-lg sm:rounded-lg">
      <h1 className="flex items-center p-3 border-b bg-white sm:rounded-t-lg text-2xl font-bold mb-4">Mis Chats</h1>
      
      {loading ? (
        <div className="flex flex-col items-center justify-center p-10">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-500">Cargando conversaciones...</p>
        </div>
      ) : conversations.length > 0 ? (
        <ul className="space-y-2">
          {conversations.map(conv => (
            <li
              key={conv._id}
              onClick={() => handleSelectConversation(conv)}
              className="p-3 border rounded cursor-pointer hover:bg-gray-100 flex items-center relative"
            >
              <img
                src={conv.partner?.avatar || '/default-avatar.png'} // Added leading slash
                alt={conv.partner?.username || 'Usuario'}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div className="flex-1">
                <p className="font-semibold">{conv.partner?.username || 'Usuario'}</p>
                {conv.lastMessage && (
                  <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                )}
              </div>
              {conv.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {conv.unreadCount}
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center justify-center p-10">
          <p className="text-gray-500">No hay conversaciones disponibles.</p>
        </div>
      )}
    </div>
  );
}