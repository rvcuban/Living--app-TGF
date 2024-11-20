import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function PropertyApplications() {
  const { listingId } = useParams();
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    // Obtener las solicitudes de la propiedad
    fetch(`/api/applications/property/${listingId}`, {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success !== false) {
          setApplications(data.applications);
        } else {
          console.error('Error fetching applications:', data.message);
        }
      })
      .catch((error) => {
        console.error('Error fetching applications:', error);
      });
  }, [id]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6">Solicitudes</h1>
      {applications.length > 0 ? (
        <ul className="space-y-4">
          {/* Mapea y muestra cada solicitud */}
          {applications.map((application) => (
            <li key={application._id} className="bg-white shadow-md rounded-lg p-4">
              {/* Información de la solicitud */}
              <p>Solicitante: {application.userId.username}</p>
              <p>Estado: {application.status}</p>
              {/* Botones para aceptar o rechazar la solicitud */}
              <div className="flex mt-2">
                <button className="bg-green-500 text-white px-4 py-2 rounded mr-2">Aceptar</button>
                <button className="bg-red-500 text-white px-4 py-2 rounded">Rechazar</button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tienes solicitudes para esta propiedad.</p>
      )}
    </div>
  );
}
