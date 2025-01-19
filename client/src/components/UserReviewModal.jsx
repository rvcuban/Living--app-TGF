// UserReviewModal.jsx
import React, { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';

/**
 * @param {Function} onClose         - Función para cerrar el modal (cambia showModal a false)
 * @param {string} targetUserId      - ID del usuario al que se le va a dejar la reseña
 * @param {string} currentUserToken  - Token JWT del usuario actual (para la autorización)
 * @param {boolean} visible          - Indica si el modal se muestra o no
 * @param {Function} onReviewCreated - Callback cuando la reseña se crea con éxito (para refrescar la lista de reseñas, etc.)
 */
export default function UserReviewModal({
  onClose,
  targetUserId,
  currentUserToken,
  visible = false,
  onReviewCreated = () => {},
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!visible) return null; // si no está visible, no se renderiza

  const handleCreateReview = async () => {
    try {
      if (rating < 1) {
        toast.error('Por favor, selecciona al menos 1 estrella.');
        return;
      }
      if (!comment.trim()) {
        toast.error('Por favor, añade un comentario.');
        return;
      }

      const body = {
        targetUser: targetUserId, // ID del usuario reseñado
        rating,
        comment,
      };
      console.log('Enviando reseña a userID:', targetUserId);

      const res = await fetch('/api/userreview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUserToken}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('¡Reseña creada correctamente!');
        // Limpia el formulario
        setRating(0);
        setComment('');
        // Opcional: cierra el modal
        onClose();
        // Llama a un callback para refrescar la lista de reseñas
        onReviewCreated(data.review);
      } else {
        toast.error(data.message || 'Error al crear la reseña.');
      }
    } catch (err) {
      console.error('Error al crear reseña:', err);
      toast.error('Ha ocurrido un error al crear la reseña.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      {/* Contenedor principal del modal (para detener propagación de onClick) */}
      <div
        className="bg-white rounded-lg p-6 w-full max-w-md shadow-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold text-lg"
        >
          &times;
        </button>
        <h2 className="text-xl font-bold mb-4 text-gray-800">Dejar una reseña</h2>

        {/* Sección de estrellas */}
        <div className="flex items-center mb-4">
          <span className="mr-3 font-medium text-gray-600">Puntuación:</span>
          {Array.from({ length: 5 }, (_, index) => {
            const starValue = index + 1;
            return (
              <FaStar
                key={`star-${index}`}
                onClick={() => setRating(starValue)}
                className={`cursor-pointer text-2xl mr-1 ${
                  starValue <= rating ? 'text-yellow-500' : 'text-gray-300'
                }`}
              />
            );
          })}
        </div>

        {/* Campo de texto */}
        <textarea
          className="border border-gray-300 rounded w-full p-2 mb-4"
          rows={4}
          placeholder="Comparte tu experiencia o tu opinión sobre este usuario..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        {/* Botones */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded mr-2 hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreateReview}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Enviar
          </button>
        </div>
      </div>
    </div>
  );
}
