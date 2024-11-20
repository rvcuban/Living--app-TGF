// src/pages/MyProperties.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelope, FaUsers, FaEdit } from 'react-icons/fa';

export default function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener las propiedades del usuario al cargar el componente
    fetch('/api/listing/user', {
      credentials: 'include',
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success !== false) {
          const fetchedProperties = data; // 'data' es el arreglo de propiedades

          if (Array.isArray(fetchedProperties)) {
            // Para cada propiedad, obtener el resumen
            const fetchSummaries = fetchedProperties.map((property) =>
              fetch(`/api/listing/${property._id}/summary`, {
                credentials: 'include',
              })
                .then((res) => res.json())
                .then((summaryData) => {
                  if (summaryData.success) {
                    return {
                      ...property,
                      applicationsCount: summaryData.data.applicationsCount,
                      membersCount: summaryData.data.membersCount,
                      capacity: summaryData.data.capacity,
                    };
                  } else {
                    console.error(
                      `Error fetching summary for property ${property._id}:`,
                      summaryData.message
                    );
                    return property;
                  }
                })
                .catch((error) => {
                  console.error(
                    `Error fetching summary for property ${property._id}:`,
                    error
                  );
                  return property;
                })
            );

            // Esperar a que todas las solicitudes se completen
            Promise.all(fetchSummaries).then((updatedProperties) => {
              setProperties(updatedProperties);
              setLoading(false);
            });
          } else {
            console.error('Las propiedades obtenidas no son un arreglo:', fetchedProperties);
            setLoading(false);
          }
        } else {
          console.error('Error fetching properties:', data.message);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error fetching properties:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Cargando propiedades...</p>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-semibold mb-6">Mis Propiedades</h1>
      {properties.length > 0 ? (
        <ul className="space-y-4">
          {properties.map((property) => (
            <li
              key={property._id}
              className="bg-white shadow-md rounded-lg p-4 flex flex-col sm:flex-row sm:items-center"
            >
              {/* Contenedor de imagen e información */}
              <div className="flex flex-1 items-start">
                {/* Imagen de la propiedad */}
                <img
                  src={property.imageUrls[0]}
                  alt={property.address}
                  className="h-20 w-20 object-cover rounded-md mr-4 flex-shrink-0"
                />
                {/* Información de la propiedad */}
                <div className="flex-1 max-w-full">
                  <h2
                    className="text-lg font-bold break-words truncate"
                    title={property.name}
                  >
                    {property.name}
                  </h2>
                  <p className="text-gray-600">
                    {property.offer
                      ? property.discountPrice
                      : property.regularPrice}{' '}
                    € / {property.type === 'rent' ? 'mes' : 'venta'}
                  </p>
                  {/* Mostrar el número de solicitudes y miembros */}
                  <div className="flex items-center mt-2 flex-wrap gap-2">
                    {/* Botón para ver las solicitudes */}
                    <Link
                      to={`/listing/${property._id}/applications`}
                      className="flex items-center text-blue-500 mr-4"
                    >
                      <FaEnvelope className="mr-1" />
                      <span>{property.applicationsCount || 0} Solicitudes</span>
                    </Link>
                    {/* Mostrar el número de miembros actuales */}
                    <div className="flex items-center text-green-500">
                      <FaUsers className="mr-1" />
                      <span>
                        {property.membersCount || 0} Miembros
                      </span>
                    </div>
                  </div>
                  {/* Botón de Editar */}
                  <Link
                    to={`/update-listing/${property._id}`}
                    className="text-blue-500 hover:text-blue-700 mr-4 flex items-center"
                  >
                    <FaEdit className="mr-1" />
                    <span>Editar</span>
                  </Link>
                </div>
              </div>
              {/* Botón deslizante */}
              <div className="flex items-center mt-4 sm:mt-0 sm:ml-4">
                <label className="flex items-center cursor-pointer mr">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={property.visible}
                      onChange={() =>
                        handleToggle(property._id, property.visible)
                      }
                      className="sr-only"
                    />
                    <div className="block bg-gray-200 w-14 h-8 rounded-full"></div>
                    <div
                      className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition ${
                        property.visible
                          ? 'transform translate-x-full bg-green-500'
                          : ''
                      }`}
                    ></div>
                  </div>
                  <span className="ml-3 text-gray-700">
                    {property.visible ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tienes propiedades agregadas.</p>
      )}
    </div>
  );
}
