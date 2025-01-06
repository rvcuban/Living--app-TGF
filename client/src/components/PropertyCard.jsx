import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaFileContract,
  FaClock,
  FaEdit,
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
      case 'Enviada':
        return 'bg-yellow-500';
      case 'Aceptada':
        return 'bg-green-500';
      case 'Rechazada':
        return 'bg-red-500';
      case 'Generando Contrato':
      case 'Esperando Confirmación':
      case 'Revisando Modificaciones':
        return 'bg-blue-500';
      case 'Confirmación Final':
        return 'bg-green-700';
      default:
        return 'bg-gray-500';
    }
  };

  // Determina el ícono según el estado
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Enviada':
        return <FaHourglassHalf className="text-white text-xs" />;
      case 'Aceptada':
        return <FaCheckCircle className="text-white text-xs" />;
      case 'Rechazada':
        return <FaTimesCircle className="text-white text-xs" />;
      case 'Generando Contrato':
      case 'Esperando Confirmación':
        return <FaFileContract className="text-white text-xs" />;
      case 'Revisando Modificaciones':
        return <FaEdit className="text-white text-xs" />;
      case 'Confirmación Final':
        return <FaCheckCircle className="text-white text-xs" />;
      default:
        return <FaClock className="text-white text-xs" />;
    }
  };

  // Función para mostrar solo el nombre del archivo sin la carpeta
  const getShortFileName = (name) => {
    if (!name) return '';
    return name.split('/').pop(); // si viniese con "contracts/.../filename.pdf"
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col">
      <div className="flex items-center">
        {/* Imagen de la propiedad */}
        <Link to={`/listing/${property._id}`}>
          <img
            src={property.imageUrls[0]}
            alt={property.address}
            className="h-24 w-24 object-cover rounded-md mr-4 flex-shrink-0"
          />
        </Link>

        {/* Información de la propiedad + acciones */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1">
            <Link to={`/listing/${property._id}`}>
              <h2
                className="text-lg font-bold text-gray-800 hover:underline truncate"
                title={property.address}
              >
                {property.address}
              </h2>
            </Link>

            <p className="text-gray-600">
              {property.offer
                ? `${property.discountPrice.toLocaleString('en-US')} €`
                : `${property.regularPrice.toLocaleString('en-US')} €`}{' '}
              / {property.type === 'rent' ? 'mes' : 'venta'}
            </p>

            
          </div>

          {/* Sección inferior de acciones */}
          <div className="flex items-center mt-2">
            {/* Si es una aplicación y tenemos un estado */}
            {isApplication && applicationStatus && (
              <div className="flex items-center mr-4">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(
                    applicationStatus
                  )} mr-2`}
                >
                  {getStatusIcon(applicationStatus)}
                </div>
                <span className="text-sm font-semibold">
                  {applicationStatus}
                </span>
              </div>
            )}

        

            {/* Si hay un contrato subido/generado */}
            {isApplication && contractUrl && (
              <a
                href={contractUrl}
                target="_blank"
                rel="noreferrer"
                className="ml-4 text-blue-600 hover:underline text-sm"
              >
                Ver Contrato ({getShortFileName(fileName)})
              </a>
            )}

            {/* Botón de cancelar si corresponde */}
            {isApplication && (
              <button
                onClick={handleCancel}
                className="text-red-600 hover:underline text-sm ml-4"
              >
                Cancelar
              </button>
            )}

            {/* Si NO es una aplicación => toggle visibility */}
            {!isApplication && (
              <label className="flex items-center cursor-pointer ml-auto">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={property.visible}
                    onChange={() =>
                      onToggleVisibility &&
                      onToggleVisibility(property._id, property.visible)
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
      </div>
    </div>
  );
}
