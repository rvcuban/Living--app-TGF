// src/pages/MyProperties.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function MyProperties() {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    // Obtener las propiedades del usuario al cargar el componente
    fetch('/api/listing/user', {
      credentials: 'include', // Incluye las cookies para autenticación
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success !== false) {
          setProperties(data);
        } else {
          console.error('Error fetching properties:', data.message);
        }
      })
      .catch((error) => {
        console.error('Error fetching properties:', error);
      });
  }, []);

  const handleToggle = (propertyId, currentStatus) => {
    // Actualizar el estado de visibilidad de la propiedad
    fetch(`/api/listing/update/${propertyId}`, {
      method: 'POST', // Según tu ruta, usas POST para actualizar
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Incluye las cookies para autenticación
      body: JSON.stringify({ visible: !currentStatus }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success !== false) {
          // Actualizar el estado localmente
          setProperties((prevProperties) =>
            prevProperties.map((property) =>
              property._id === propertyId
                ? { ...property, visible: data.visible }
                : property
            )
          );
        } else {
          console.error('Error updating property visibility:', data.message);
        }
      })
      .catch((error) => {
        console.error('Error updating property visibility:', error);
      });
  };

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
                  <h2 className="text-lg font-bold break-words truncate" title={property.name}>
                    {property.name}
                  </h2>
                  <p className="text-gray-600">
                    {property.offer
                      ? property.discountedPrice
                      : property.regularPrice}{' '}
                    € / {property.type === 'rent' ? 'mes' : 'venta'}
                  </p>
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
