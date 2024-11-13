import React, { useState, useEffect } from 'react';
import PropertyCard from '../components/PropertyCard';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Función para obtener las aplicaciones del usuario
  const fetchApplications = async () => {
    try {
      const res = await fetch('/api/applications', {
        credentials: 'include', // Incluye credenciales si son necesarias
      });
      const data = await res.json();
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
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success !== false) {
        // Actualizar el estado local eliminando la aplicación cancelada
        setApplications((prev) =>
          prev.filter((app) => app._id !== applicationId)
        );
        toast.success('Aplicación cancelada correctamente.');
      } else {
        console.error('Error canceling application:', data.message);
        toast.error('Error al cancelar la aplicación.');
      }
    } catch (error) {
      console.error('Error canceling application:', error);
      toast.error('Error al cancelar la aplicación.');
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

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
      {applications.length > 0 ? (
        <ul className="space-y-4">
          {applications.map((application) => (
            <li key={application._id}>
              <PropertyCard
                property={application.propertyId}
                onCancelApplication={handleCancelApplication}
                isApplication={true}
                applicationId={application._id} // Pasar el ID de la aplicación para cancelar
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
