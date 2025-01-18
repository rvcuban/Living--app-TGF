import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
// Importa un componente de tarjeta, o uno nuevo
import BuddyRequestItem from '../components/RoomMateRequestItem'; 
// O podrías reusar <UserItem> con modificaciones

export default function MyBuddies() {
  const [buddyRequests, setBuddyRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    if (!currentUser) return;
    fetchBuddyRequests();
  }, [currentUser]);

  const fetchBuddyRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/roommate/my-requests', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || 'Error al obtener solicitudes');
        setLoading(false);
        return;
      }
      // data.data sería un array de requests
      setBuddyRequests(data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error en fetchBuddyRequests:', error);
      toast.error('Error al obtener tus solicitudes de compañeros.');
      setLoading(false);
    }
  };

  // Manejar Aceptar
  const handleAccept = async (requestId) => {
    try {
      const res = await fetch(`/api/roommate/accept/${requestId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || 'No se pudo aceptar la solicitud');
        return;
      }
      // Actualizar la lista local
      setBuddyRequests((prev) =>
        prev.map((req) =>
          req._id === requestId ? { ...req, status: 'accepted' } : req
        )
      );
      toast.success('Solicitud aceptada. Ahora son compis!');
    } catch (error) {
      console.error('Error al aceptar solicitud:', error);
      toast.error('No se pudo aceptar la solicitud.');
    }
  };

  // Manejar Rechazar
  const handleReject = async (requestId) => {
    try {
      const res = await fetch(`/api/roommate/reject/${requestId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.message || 'No se pudo rechazar la solicitud');
        return;
      }
      // Podrías eliminarla de la lista
      setBuddyRequests((prev) => prev.filter((req) => req._id !== requestId));
      toast.info('Solicitud rechazada.');
    } catch (error) {
      console.error('Error al rechazar solicitud:', error);
      toast.error('No se pudo rechazar la solicitud.');
    }
  };

  if (!currentUser) {
    return <p className="p-4 text-xl">Debes iniciar sesión para ver tus compañeros.</p>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Mis Compañeros / Solicitudes</h2>
      {loading && <p>Cargando solicitudes...</p>}
      {!loading && buddyRequests.length === 0 && (
        <p className="text-gray-600">No tienes solicitudes pendientes ni compañeros.</p>
      )}

      {/* Renderizar la lista */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {buddyRequests.map((req) => (
          <BuddyRequestItem
            key={req._id}
            request={req}
            onAccept={handleAccept}
            onReject={handleReject}
          />
        ))}
      </div>
    </div>
  );
}
