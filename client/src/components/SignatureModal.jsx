import React, { useState } from 'react';
import { FaSignature, FaTimes, FaPaperPlane } from 'react-icons/fa';

export default function SignatureModal({ isOpen, onClose, onSign, applicationId, contractUrl }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!firstName || !lastName) {
      alert('Por favor, completa tu nombre y apellido para firmar el contrato.');
      return;
    }
    
    setIsLoading(true);
    try {
      await onSign(applicationId, { firstName, lastName });
      setIsLoading(false);
      onClose();
    } catch (error) {
      console.error('Error signing contract:', error);
      setIsLoading(false);
      alert('Error al firmar el contrato. Por favor, inténtalo de nuevo.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
        >
          <FaTimes size={20} />
        </button>
        
        <h2 className="text-2xl font-semibold mb-4 text-center">Firma del Contrato</h2>
        
        <div className="mb-6 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
          <p>Al firmar este contrato, confirmas que has leído y aceptas todos sus términos y condiciones.</p>
          {contractUrl && (
            <a 
              href={contractUrl}
              target="_blank"
              rel="noopener noreferrer" 
              className="text-blue-600 hover:underline block mt-2"
            >
              Ver contrato completo
            </a>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center border-2 border-dashed border-gray-300 p-4 rounded-md bg-gray-50">
            <FaSignature className="text-gray-400 text-2xl mr-4" />
            <div className="flex-1 space-y-3">
              <input
                type="text"
                placeholder="Nombre"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <input
                type="text"
                placeholder="Apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="flex justify-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                <>
                  <FaPaperPlane className="mr-2" />
                  Firmar y Enviar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}