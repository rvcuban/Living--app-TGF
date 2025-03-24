import React from 'react';

export default function MapVerification({ address, isVisible, onClose, onConfirm }) {
  if (!isVisible) return null;
  
  const encodedAddress = encodeURIComponent(address);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY_AUTOCOMPLETE;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>
      
      <div className="relative bg-white rounded-lg shadow-lg overflow-hidden w-11/12 md:w-3/4 lg:w-2/3 z-10">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-medium">Verificación de Dirección</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Cerrar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <p className="mb-2 text-gray-600">Dirección: <span className="font-medium">{address}</span></p>
        </div>
        
        <div className="w-full h-[450px]">
          {address && (
            <iframe
              title="Google Maps Location"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${encodedAddress}&zoom=15`}
              allowFullScreen
            ></iframe>
          )}
        </div>
        
        <div className="flex justify-between p-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Confirmar Ubicación
          </button>
        </div>
      </div>
    </div>
  );
}