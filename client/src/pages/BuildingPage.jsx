import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHardHat, FaArrowLeft } from 'react-icons/fa';

export default function BuildingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  // Optional: Automatically redirect to home after some time
  useEffect(() => {
    const timer = setTimeout(() => {
      // Uncomment if you want auto-redirect
      // navigate('/');
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] bg-blue-50 px-4">
      <div className="text-center max-w-lg">
        <div className="bg-yellow-400 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
          <FaHardHat className="text-5xl text-blue-800" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Página en construcción
        </h1>
        
        <p className="text-xl text-gray-600 mb-4">
          La ruta <span className="font-mono bg-gray-200 px-2 py-1 rounded">{path}</span> está en desarrollo.
        </p>
        
        <p className="text-gray-600 mb-8">
          Estamos trabajando para ofrecerte nuevas funcionalidades pronto. Gracias por tu paciencia.
        </p>
        
        <button 
          onClick={() => navigate('/')}
          className="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
        >
          <FaArrowLeft className="mr-2" /> Volver al inicio
        </button>
      </div>
    </div>
  );
}