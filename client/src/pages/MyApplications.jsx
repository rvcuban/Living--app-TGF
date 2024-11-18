import React, { useState, useEffect } from 'react';
import PropertyCard from '../components/PropertyCard';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useSelector } from 'react-redux';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Obtener currentUser del estado global
  const { currentUser } = useSelector((state) => state.user);

  // Función para obtener las aplicaciones del usuario
  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      console.log('Applications fetched:', data);
      if (data.success !== false) {
        setApplications(data.applications);
      } else {
        console.error('Error fetching applications:', data.message);
        setError(true);
        toast.error('Error al obtener las aplicaciones.');
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setError(true);
      toast.error('Error al obtener las aplicaciones.');
    } finally {
      setLoading(false);
    }
  };

  // Función para cancelar una aplicación
  const handleCancelApplication = async (applicationId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta aplicación?')) {
      return;
    }

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`,
        },
      });
      const data = await res.json();
      if (data.success !== false) {
        // Actualizar el estado local eliminando la aplicación cancelada
        setApplications((prev) => prev.filter((app) => app._id !== applicationId));
        toast.success('Aplicación cancelada correctamente.');
      } else {
        console.error('Error cancelando la aplicación:', data.message);
        toast.error('Error al cancelar la aplicación.');
      }
    } catch (error) {
      console.error('Error cancelando la aplicación:', error);
      toast.error('Error al cancelar la aplicación.');
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchApplications();
    } else {
      setLoading(false);
      setError(true);
      toast.error('Por favor, inicia sesión para ver tus aplicaciones.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-xl text-gray-700">Por favor, inicia sesión para ver tus aplicaciones.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-xl text-gray-700">Cargando aplicaciones...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-xl text-red-600">Error al cargar las aplicaciones.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6 text-center">Mis Aplicaciones</h1>
      <ToastContainer />
      {applications.length > 0 ? (
        <ul className="space-y-4">
          {applications.map((application) => (
            <li key={application._id}>
              <PropertyCard
                property={application.propertyId}
                applicationStatus={application.status}
                applicationId={application._id}
                isApplication={true}
                onCancelApplication={handleCancelApplication}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-600">No has aplicado a ninguna propiedad aún.</p>
      )}
    </div>
  );
}
