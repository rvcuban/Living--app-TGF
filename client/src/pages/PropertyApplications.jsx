import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // Importamos Link y useNavigate
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export default function PropertyApplications() {
  const { listingId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate(); // Para redirigir al usuario

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await fetch(`/api/applications/listing/${listingId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser.token}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setApplications(data.applications);
        } else {
          toast.error(data.message || 'Error al obtener las solicitudes.');
        }
      } catch (error) {
        console.error('Error fetching applications:', error);
        toast.error('Error al obtener las solicitudes.');
      }
    };

    fetchApplications();
  }, [listingId, currentUser.token]);

  const calculateUserScore = (user) => {
    let score = 0;
    if (user.email) score += 20;
    if (user.phoneNumber) score += 20;
    if (user.gender) score += 20;
    if (user.idDocument) score += 40;
    return score;
  };

  const handleAccept = async (applicationId) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Solicitud aceptada.');
        // Actualizar el estado de la aplicación en el estado local
        setApplications((prevApplications) =>
          prevApplications.map((app) =>
            app._id === applicationId ? { ...app, status: 'Aceptada' } : app
          )
        );
      } else {
        toast.error(data.message || 'Error al aceptar la solicitud.');
      }
    } catch (error) {
      console.error('Error accepting application:', error);
      toast.error('Error al aceptar la solicitud.');
    }
  };

  const handleReject = async (applicationId) => {
    try {
      const res = await fetch(`/api/applications/${applicationId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Solicitud rechazada.');
        // Eliminar la aplicación del estado local
        setApplications((prevApplications) =>
          prevApplications.filter((app) => app._id !== applicationId)
        );
      } else {
        toast.error(data.message || 'Error al rechazar la solicitud.');
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
      toast.error('Error al rechazar la solicitud.');
    }
  };

  const handleContact = (userId) => {
    // Navegar a la página de mensajes o abrir una ventana de chat
    navigate(`/messages/${userId}`);
  };

  console.log('listingId:', listingId);

  console.log('listingId:', listingId); // Añade este console.log

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6 text-center">
        Solicitudes para tu Propiedad
      </h1>
      {applications.length > 0 ? (
        <ul className="space-y-4">
          {applications.map((application) => {
            const user = application.userId;
            const userScore = calculateUserScore(user);

            return (
              <li
                key={application._id}
                className="border p-4 rounded-md shadow flex flex-col md:flex-row items-center md:items-start"
              >
                {/* Enlace a perfil público */}
                <Link
                  to={`/user/${user._id}`}
                  className="flex flex-col items-center md:flex-row md:items-center mb-4 md:mb-0 md:mr-4 text-center md:text-left mx-auto md:mx-0"
                >
                  <img
                    src={user.avatar || '/default-profile.png'}
                    alt={`${user.username || 'Usuario'} profile`}
                    className="w-16 h-16 rounded-full mb-2 md:mb-0 md:mr-4"
                  />
                  <div>
                    <h2 className="text-xl font-semibold">
                      {user.username || 'Usuario'}
                    </h2>
                    <p className="text-gray-600">
                      Puntaje del usuario: {userScore}
                    </p>
                    <p className="text-gray-600">
                      Estado de la solicitud: {application.status}
                    </p>
                  </div>
                </Link>
                {/* Botones de acción */}
                <div className="flex flex-col md:flex-row mt-4 md:mt-0 md:ml-auto">
                  <button
                    className="bg-green-500 text-white px-4 py-2 rounded mr-0 md:mr-2 mb-2 md:mb-0"
                    onClick={() => handleAccept(application._id)}
                  >
                    Aceptar
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded mr-0 md:mr-2 mb-2 md:mb-0"
                    onClick={() => handleReject(application._id)}
                  >
                    Rechazar
                  </button>
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    onClick={() => handleContact(user._id)}
                  >
                    Contactar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-center text-gray-600">
          No hay solicitudes para esta propiedad.
        </p>
      )}
    </div>
  );
}
