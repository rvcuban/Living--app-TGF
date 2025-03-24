import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserSuccess } from '../redux/user/userSlice';
import { toast } from 'react-toastify';

export default function ProfileCompletionModal({ onComplete, onCancel }) {
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    address: currentUser?.address || '',
    numeroIdentificacion: currentUser?.numeroIdentificacion || '',
    tipoIdentificacion: currentUser?.tipoIdentificacion || 'DNI',
    phone: currentUser?.phone || ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.username || !formData.address || !formData.numeroIdentificacion || !formData.tipoIdentificacion) {
      setError('Por favor, completa todos los campos requeridos.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (data.success === false) {
        setError(data.message);
        setLoading(false);
        return;
      }
      
      // Update the Redux store with updated user data
      dispatch(updateUserSuccess({
        ...currentUser,
        ...formData,
      }));
      
      // Also update localStorage
      const updatedUser = { ...currentUser, ...formData };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      
      setLoading(false);
      toast.success('Perfil actualizado correctamente');
      
      // Call the onComplete callback
      if (onComplete) onComplete();
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Error al actualizar el perfil');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Completa tu perfil</h2>
        <p className="mb-4 text-gray-600">
          Para generar un contrato de arrendamiento, necesitamos algunos datos adicionales:
        </p>
        
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Nombre completo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Tu nombre completo"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Dirección <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Tu dirección completa"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="tipoIdentificacion" className="block text-sm font-medium text-gray-700">
                Tipo de ID <span className="text-red-500">*</span>
              </label>
              <select
                id="tipoIdentificacion"
                value={formData.tipoIdentificacion}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="DNI">DNI</option>
                <option value="NIE">NIE</option>
                <option value="Pasaporte">Pasaporte</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="numeroIdentificacion" className="block text-sm font-medium text-gray-700">
                Número de ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="numeroIdentificacion"
                value={formData.numeroIdentificacion}
                onChange={handleChange}
                placeholder="12345678A"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Tu número de teléfono"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-200 disabled:bg-blue-300"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Guardar y continuar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}