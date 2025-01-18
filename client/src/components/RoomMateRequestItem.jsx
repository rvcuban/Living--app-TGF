import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';

export default function RoomMateRequestItem({ request, onAccept, onReject }) {
  // request = { _id, sender: { username, avatar, ... }, status, ... }
  const { _id, sender, status } = request;

  return (
    <div className="bg-white border border-gray-300 rounded-xl p-4 flex flex-col items-start">
      <div className="flex items-center w-full">
        <img
          src={sender?.avatar || '/default-profile.png'}
          alt={`${sender?.username || 'Usuario'} avatar`}
          className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
        />
        <div className="ml-4 flex-1">
          <p className="font-semibold text-slate-800">{sender?.username || 'Sin Nombre'}</p>
          {sender?.verified && (
            <FaCheckCircle className="text-green-500 ml-1 inline" title="Verificado" />
          )}
          {/* Podrías mostrar la ubicación, badges, etc. */}
          {status === 'accepted' && (
            <p className="text-sm text-green-600">Ahora sois compañeros</p>
          )}
          {status === 'pending' && (
            <p className="text-sm text-yellow-600">Solicitud pendiente</p>
          )}
        </div>
      </div>

      {/* Botones para Aceptar/Rechazar si está pendiente */}
      {status === 'pending' && (
        <div className="mt-4 flex gap-2">
          <button
            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
            onClick={() => onAccept(_id)}
          >
            Aceptar
          </button>
          <button
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
            onClick={() => onReject(_id)}
          >
            Rechazar
          </button>
        </div>
      )}
    </div>
  );
}
