// src/components/PropertyCard.jsx

import React from 'react';
import { Link } from 'react-router-dom';


export default function PropertyCard({
  property,
  applicationStatus,
  
  onCancelApplication, // Función para cancelar aplicaciones (solo en Aplicaciones)
  isApplication, // Booleano para indicar si es una aplicación
  applicationId, // ID de la aplicación (solo en Aplicaciones)
  onToggleVisibility, // Función para cambiar visibilidad (solo en Mis Propiedades)
}) {

  const handleCancel = () => {
    if (onCancelApplication) {
        onCancelApplication(applicationId);
    }
};
const getStatusColor = (status) => {
  switch (status) {
      case 'approved':
          return 'bg-green-500';
      case 'rejected':
          return 'bg-red-500';
      case 'pending':
          return 'bg-yellow-500';
      default:
          return 'bg-gray-500';
  }
};

// Determinar el texto del estado
const getStatusText = (status) => {
  switch (status) {
      case 'approved':
          return 'Aprobado';
      case 'rejected':
          return 'Rechazado';
      case 'pending':
          return 'Pendiente';
      default:
          return 'Desconocido';
  }
};

const renderStatus = () => {
  switch (applicationStatus) {
      case 'approved':
          return (
              <div className="flex items-center gap-1 text-green-500">
                  <FaCheckCircle />
                  <span className="font-semibold capitalize">Aprobado</span>
              </div>
          );
      case 'rejected':
          return (
              <div className="flex items-center gap-1 text-red-500">
                  <FaTimesCircle />
                  <span className="font-semibold capitalize">Rechazado</span>
              </div>
          );
      case 'pending':
          return (
              <div className="flex items-center gap-1 text-yellow-500">
                  <FaHourglassHalf />
                  <span className="font-semibold capitalize">Pendiente</span>
              </div>
          );
      default:
          return (
              <div className="flex items-center gap-1 text-gray-500">
                  <FaHourglassHalf />
                  <span className="font-semibold capitalize">{applicationStatus}</span>
              </div>
          );
  }
};


  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col sm:flex-row sm:items-center">
      {/* Imagen de la propiedad */}
      <Link to={`/listing/${property._id}`}>
        <img
          src={property.imageUrls[0]}
          alt={property.name}
          className="h-20 w-20 object-cover rounded-md mr-4 flex-shrink-0"
        />
      </Link>

      {/* Información de la propiedad */}
      <div className="flex-1">
        <Link to={`/listing/${property._id}`}>
          <h2
            className="text-lg font-bold text-gray-800 hover:underline truncate"
            title={property.name}
          >
            {property.name}
          </h2>
        </Link>
        <p className="text-gray-600">
          {property.offer
            ? `${property.discountPrice.toLocaleString('en-US')} €`
            : `${property.regularPrice.toLocaleString('en-US')} €`}{" "}
          / {property.type === 'rent' ? 'mes' : 'venta'}
        </p>
        <p className="text-gray-600 truncate" title={property.address}>
          {property.address}
        </p>
      </div>

      {/* Acciones adicionales */}
      <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col items-center gap-2">
                {isApplication && applicationStatus && (
                    <div className="flex flex-col items-center">
                        {/* Círculo de estado */}
                        <div className={`w-4 h-4 rounded-full ${getStatusColor(applicationStatus)} mb-1`}></div>
                        {/* Texto de estado */}
                        <span className="text-sm font-semibold">{getStatusText(applicationStatus)}</span>
                    </div>
                )}

                {isApplication ? (
                    applicationStatus === 'pending' && (
                        <button
                            onClick={handleCancel}
                            className="text-red-600 hover:underline text-sm"
                        >
                            Cancelar Aplicación
                        </button>
                    )
                ) : (
                    <label className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input
                                type="checkbox"
                                checked={property.visible}
                                onChange={() =>
                                    onToggleVisibility && onToggleVisibility(property._id, property.visible)
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
                )}
            </div>
    </div>
  );
}
