import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import { FaEnvelope, FaLock } from 'react-icons/fa';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      // Create data object with the generateUsername flag
      const dataToSend = {
        ...formData,
        generateUsername: true  // Make sure this flag is set to true
      };
      
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      const data = await res.json();
      
      if (data.success === false) {
        setLoading(false);
        setError(data.message);
        return;
      }
      
      setLoading(false);
      navigate('/sign-in');
    } catch (error) {
      setLoading(false);
      setError(error.message || 'Error al registrarse. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Crear una cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Tu nombre de usuario será generado automáticamente
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
              Correo electrónico
            </label>
            <div className="mt-2 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FaEnvelope className="text-gray-400" />
              </div>
              <input
                id="email"
                type="email"
                placeholder="tu@email.com"
                onChange={handleChange}
                required
                className="block w-full rounded-lg border-0 py-3 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
              Contraseña
            </label>
            <div className="mt-2 relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <FaLock className="text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                onChange={handleChange}
                required
                className="block w-full rounded-lg border-0 py-3 pl-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-pink-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-pink-500 px-4 py-3 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-pink-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Creando cuenta...' : 'Registrarse'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O continúa con</span>
            </div>
          </div>

          <div className="mt-6">
            <OAuth />
          </div>
        </div>

        <p className="mt-10 text-center text-sm text-gray-500">
          ¿Ya tienes cuenta?{' '}
          <Link to="/sign-in" className="font-semibold leading-6 text-pink-500 hover:text-pink-600">
            Inicia sesión
          </Link>
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}