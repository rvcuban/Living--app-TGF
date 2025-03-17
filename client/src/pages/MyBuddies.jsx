import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaTimesCircle, FaUserFriends, FaHourglassHalf } from 'react-icons/fa';
// Import components as needed

export default function MyBuddies() {
  const [buddyRequests, setBuddyRequests] = useState([]);
  const [acceptedBuddies, setAcceptedBuddies] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState('requests');

  useEffect(() => {
    if (!currentUser) return;
    fetchBuddyRequests();
  }, [currentUser]);

  const fetchBuddyRequests = async () => {
    try {
      setLoading(true);
      
      // Get received requests
      const resReceived = await fetch('/api/roommate/received', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      
      // Get sent requests
      const resSent = await fetch('/api/roommate/sent', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
      });

      // Get my buddies (accepted requests)
      const resBuddies = await fetch('/api/roommate/buddies', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      
      const dataReceived = await resReceived.json();
      const dataSent = await resSent.json();
      const dataBuddies = await resBuddies.json();
      
      // Combine and format all requests
      const allRequests = [
        ...(dataReceived.success ? (dataReceived.applications || []).map(req => ({
          ...req,
          direction: 'received'
        })) : []),
        ...(dataSent.success ? (dataSent.applications || []).map(req => ({
          ...req,
          direction: 'sent'
        })) : [])
      ].filter(req => req.status === 'pending');
      
      // Get accepted buddies
      const buddies = dataBuddies.success ? dataBuddies.buddies || [] : [];
      
      setBuddyRequests(allRequests);
      setAcceptedBuddies(buddies);
      setLoading(false);
    } catch (error) {
      console.error('Error en fetchBuddyRequests:', error);
      toast.error('Error al obtener tus solicitudes de compañeros.');
      setLoading(false);
    }
  };

  // Handle Accept
  const handleAccept = async (requestId) => {
    try {
      const res = await fetch(`/api/roommate/accept/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      
      const data = await res.json();
      
      if (!data.success) {
        toast.error(data.message || 'No se pudo aceptar la solicitud');
        return;
      }
      
      // Update local list
      const acceptedRequest = buddyRequests.find(req => req._id === requestId);
      
      if (acceptedRequest) {
        // Add to buddies list
        setAcceptedBuddies(prev => [...prev, {
          ...acceptedRequest,
          status: 'accepted'
        }]);
        
        // Remove from requests
        setBuddyRequests(prev => prev.filter(req => req._id !== requestId));
      }
      
      toast.success('Solicitud aceptada. ¡Ahora son compañeros!');
    } catch (error) {
      console.error('Error al aceptar solicitud:', error);
      toast.error('No se pudo aceptar la solicitud.');
    }
  };

  // Handle Reject
  const handleReject = async (requestId) => {
    try {
      const res = await fetch(`/api/roommate/reject/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      
      const data = await res.json();
      
      if (!data.success) {
        toast.error(data.message || 'No se pudo rechazar la solicitud');
        return;
      }
      
      // Remove from requests list
      setBuddyRequests(prev => prev.filter(req => req._id !== requestId));
      toast.info('Solicitud rechazada.');
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      toast.error('No se pudo rechazar la solicitud.');
    }
  };

  // Handle Remove Buddy
  const handleRemoveBuddy = async (buddyId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar a este compañero?')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/roommate/remove/${buddyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      
      const data = await res.json();
      
      if (!data.success) {
        toast.error(data.message || 'No se pudo eliminar al compañero');
        return;
      }
      
      // Remove from buddies list
      setAcceptedBuddies(prev => prev.filter(buddy => buddy._id !== buddyId));
      toast.info('Compañero eliminado correctamente.');
    } catch (error) {
      console.error('Error al eliminar compañero:', error);
      toast.error('No se pudo eliminar al compañero.');
    }
  };

  if (!currentUser) {
    return (
      <div className="max-w-5xl mx-auto p-4 text-center">
        <p className="p-4 text-xl mb-4">Debes iniciar sesión para ver tus compañeros.</p>
        <Link to="/sign-in" className="bg-blue-500 text-white px-4 py-2 rounded">
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Mis Compañeros</h2>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'requests' 
            ? 'border-b-2 border-blue-500 text-blue-600 font-medium' 
            : 'text-gray-600 hover:text-blue-500'}`}
          onClick={() => setActiveTab('requests')}
        >
          Solicitudes Pendientes {buddyRequests.length > 0 && (
            <span className="ml-2 bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
              {buddyRequests.length}
            </span>
          )}
        </button>
        
        <button
          className={`px-4 py-2 ${activeTab === 'buddies'
            ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
            : 'text-gray-600 hover:text-blue-500'}`}
          onClick={() => setActiveTab('buddies')}
        >
          Compañeros Aceptados {acceptedBuddies.length > 0 && (
            <span className="ml-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs">
              {acceptedBuddies.length}
            </span>
          )}
        </button>
      </div>
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="ml-3 text-gray-600">Cargando...</p>
        </div>
      )}
      
      {/* Pending Requests Tab */}
      {!loading && activeTab === 'requests' && (
        <>
          {buddyRequests.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-2">No tienes solicitudes pendientes.</p>
              <Link to="/search" className="text-blue-500 hover:underline">
                Busca nuevos compañeros
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {buddyRequests.map((request) => (
                <div key={request._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <img 
                        src={request.direction === 'received' 
                          ? request.applicantId?.avatar || '/default-profile.png'
                          : request.listingId?.owner?.avatar || '/default-profile.png'} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium">
                          {request.direction === 'received'
                            ? request.applicantId?.username || 'Usuario'
                            : request.listingId?.owner?.username || 'Usuario'}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <FaHourglassHalf className="mr-1 text-yellow-500" /> 
                          {request.direction === 'received' ? 'Te envió solicitud' : 'Solicitud enviada'}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">
                      Enviado el {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                    
                    {request.direction === 'received' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleAccept(request._id)}
                          className="flex-1 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center"
                        >
                          <FaCheckCircle className="mr-1" /> Aceptar
                        </button>
                        <button
                          onClick={() => handleReject(request._id)}
                          className="flex-1 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
                        >
                          <FaTimesCircle className="mr-1" /> Rechazar
                        </button>
                      </div>
                    )}
                    
                    {request.direction === 'sent' && (
                      <div className="flex justify-center mt-3">
                        <button
                          onClick={() => handleReject(request._id)}
                          className="py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                        >
                          Cancelar solicitud
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
      
      {/* Accepted Buddies Tab */}
      {!loading && activeTab === 'buddies' && (
        <>
          {acceptedBuddies.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-gray-600 mb-2">No tienes compañeros aceptados aún.</p>
              <Link to="/search" className="text-blue-500 hover:underline">
                Busca compañeros
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {acceptedBuddies.map((buddy) => (
                <div key={buddy._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  <div className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <img 
                        src={buddy.user?.avatar || '/default-profile.png'} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-medium">{buddy.user?.username || 'Compañero'}</h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <FaCheckCircle className="mr-1 text-green-500" /> Compañero
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-4">
                      <Link 
                        to={`/chat/${buddy.user?._id}`} 
                        className="flex-1 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-center"
                      >
                        Enviar mensaje
                      </Link>
                      <Link 
                        to={`/user/${buddy.user?._id}/public`} 
                        className="flex-1 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-center"
                      >
                        Ver perfil
                      </Link>
                    </div>
                    
                    <div className="mt-2">
                      <button
                        onClick={() => handleRemoveBuddy(buddy._id)}
                        className="w-full py-2 border border-red-500 text-red-500 rounded hover:bg-red-50"
                      >
                        Eliminar compañero
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}