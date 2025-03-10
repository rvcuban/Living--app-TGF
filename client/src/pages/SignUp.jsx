import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import OAuth from '../components/OAuth';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import api from '../utils/apiFetch';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
        generateUsername: true
      };
      
      // 1. Register the user
      const registerRes = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      const registerData = await registerRes.json();
      
      if (!registerRes.ok) {
        setLoading(false);
        setError(registerData.message);
        return;
      }
      
      // 2. Auto login after successful registration
      const loginRes = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      
      const loginData = await loginRes.json();
      
      if (!loginRes.ok) {
        setLoading(false);
        // Registration was successful but login failed
        setError('Cuenta creada correctamente. Por favor inicia sesión.');
        navigate('/sign-in');
        return;
      }
      
      // 3. Store user in Redux and localStorage
      localStorage.setItem('accessToken', loginData.token);
      dispatch(signInSuccess(loginData.user));
      
      setLoading(false);
      
      // 4. Redirect to onboarding instead of sign-in
      navigate('/onboarding');
      
    } catch (error) {
      setLoading(false);
      setError(error.message || 'Error al registrarse. Inténtalo de nuevo.');
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      {/* Rest of your component remains the same */}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Crear una cuenta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-500">
          Tu nombre de usuario será generado automáticamente
        </p>
      </div>

      {/* Form remains the same */}
      {/* ... */}
      
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}