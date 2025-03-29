import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaFileContract,
  FaClock,
  FaEdit,
  FaHome,
} from 'react-icons/fa';

/**
 * Props esperadas:
 * - property: { _id, name, address, imageUrls, regularPrice, discountPrice, type, offer, ... }
 * - applicationStatus: string  (e.g. "Enviada", "Aceptada", etc.)
 * - onCancelApplication: function (callback para cancelar la solicitud)
 * - isApplication: boolean (indica si estamos mostrando esta card en contexto de aplicación)
 * - applicationId: string (para saber qué solicitud cancelar)
 * - onToggleVisibility: function (para cambiar visibilidad si es tu backend)
 *
 * Opcionales para mostrar info extra de la App:
 * - rentalDuration (número de meses) -> p.ej. 3, 6, 12
 * - contractUrl (url del contrato en Firebase, si existe)
 * - fileName (nombre de archivo, si quieres mostrarlo sin la carpeta)
 */
export default function PropertyCard({
  property,
  applicationStatus,
  onCancelApplication,
  isApplication,
  applicationId,
  onToggleVisibility,
  rentalDuration,
  contractUrl,
  fileName,
}) {
  // Para cancelar la app
  const handleCancel = () => {
    if (onCancelApplication) {
      onCancelApplication(applicationId);
    }
  };

  // Determina el color del círculo según el estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'Enviada': return 'bg-yellow-500';
      case 'Aceptada': return 'bg-green-500';
      case 'Rechazada': return 'bg-red-500';
      case 'Generando Contrato':
      case 'Esperando Confirmación':
      case 'Revisando Modificaciones':
      case 'Contrato Notificado':
      case 'Firmado por Propietario': return 'bg-blue-500';
      case 'Confirmación Final':
      case 'Firmado': return 'bg-green-700';
      case 'Firmado por Inquilino': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  // Determina el ícono según el estado
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Enviada': return <FaHourglassHalf className="text-white" />;
      case 'Aceptada': return <FaCheckCircle className="text-white" />;
      case 'Rechazada': return <FaTimesCircle className="text-white" />;
      case 'Generando Contrato':
      case 'Esperando Confirmación':
      case 'Firmado por Propietario':
      case 'Contrato Notificado': return <FaFileContract className="text-white" />;
      case 'Revisando Modificaciones': return <FaEdit className="text-white" />;
      case 'Confirmación Final':
      case 'Firmado': return <FaCheckCircle className="text-white" />;
      case 'Firmado por Inquilino': return <FaCheckCircle className="text-white" />;
      default: return <FaClock className="text-white" />;
    }
  };

  // Función para mostrar solo el nombre del archivo sin la carpeta
  const getShortFileName = (name) => {
    if (!name) return '';
    return name.split('/').pop(); // si viniese con "contracts/.../filename.pdf"
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Imagen de la propiedad */}
        <Link
          to={`/listing/${property._id}`}
          className="sm:flex-shrink-0"
        >
          <div className="aspect-[4/3] sm:h-24 sm:w-24 rounded-md overflow-hidden">
            <img
              src={property?.imageUrls?.[0] || defaultImage}
              alt={property.address || "Property"}
              className="h-full w-full object-cover rounded-md"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImage;
              }}
              loading="lazy"
            />
          </div>
        </Link>

        {/* Información de la propiedad + acciones */}
        <div className="flex-1 min-w-0">
          <div className="flex-1">
            <Link to={`/listing/${property._id}`}>
              <h2
                className="text-base font-semibold text-gray-800 hover:underline line-clamp-1" title={property.address}
              >
                {property.address}
              </h2>
            </Link>

            <p className="text-sm text-gray-600 mt-1 line-clamp-1">
            {property.type === 'rent' || property.type === 'alquiler' ? (
              <>
                {property.regularPrice || property.price}€ / mes
                {rentalDuration && <span className="text-xs text-gray-500 ml-1">({rentalDuration} meses)</span>}
              </>
            ) : (
              <>{property.regularPrice || property.price}€</>
            )}
          </p>


          </div>

          {/* Sección inferior de acciones */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {/* Status badge if applicable */}
            {isApplication && applicationStatus && (
              <div className="flex items-center mr-auto">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center ${getStatusColor(
                    applicationStatus
                  )} mr-1.5`}
                >
                  {getStatusIcon(applicationStatus)}
                </div>
                <span className="text-xs font-medium line-clamp-1">
                  {applicationStatus}
                </span>
              </div>
            )}



            {/* Si hay un contrato subido/generado */}
            <div className="flex flex-wrap gap-2 ml-auto">
              {/* Contract link if available */}
              {isApplication && contractUrl && (
                <a
                  href={contractUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline text-xs"
                >
                  Ver Contrato
                </a>
              )}

              {/* Cancel button for applications */}
              {isApplication && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleCancel();
                  }}
                  className="text-red-600 hover:underline text-xs"
                >
                  Cancelar
                </button>
              )}

              {/* Toggle visibility if this is in property management view */}
              {!isApplication && onToggleVisibility && (
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={property.visible}
                      onChange={() => onToggleVisibility(property._id, property.visible)}
                      className="sr-only"
                    />
                    <div className="block bg-gray-200 w-10 h-6 rounded-full"></div>
                    <div
                      className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${
                        property.visible ? 'transform translate-x-full bg-green-500' : ''
                      }`}
                    ></div>
                  </div>
                  <span className="ml-2 text-xs text-gray-700">
                    {property.visible ? 'Activo' : 'Inactivo'}
                  </span>
                </label>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}