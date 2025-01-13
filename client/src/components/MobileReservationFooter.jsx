// MobileReservationFooter.jsx

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function MobileReservationFooter({ listing, onReserve }) {
  const [rentalDurationMonths, setRentalDurationMonths] = useState(3);
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);

  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const handleReservationSubmit = () => {
    setShowPopup(true);
  };

  const handleAccept = async () => {
    if (!currentUser) {
      toast.info("Por favor, inicia sesión para reservar.");
      navigate('/sign-in');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${currentUser.token}`,
        },
        body: JSON.stringify({
          listingId: listing._id,           // <-- Usa listing._id
          rentalDurationMonths,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Aplicación enviada exitosamente.");
        setShowPopup(false);
        if (onReserve) onReserve(); // callback opcional
      } else {
        toast.error(data.message || "Error al enviar la aplicación.");
      }
    } catch (error) {
      console.error("Error al enviar la aplicación:", error);
      toast.error("Error al enviar la aplicación.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowPopup(false);
  };

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-md lg:hidden">
      <div className="flex items-center justify-start space-x-4 ml-10">
        <div>
          <p className="text-lg font-semibold text-sah-primary">
            {listing.offer
              ? `$${listing.discountPrice.toLocaleString('en-US')}`
              : `$${listing.regularPrice.toLocaleString('en-US')}`}
            {listing.type === 'rent' && ' / mes'}
          </p>
        </div>
        <button
          onClick={handleReservationSubmit}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-md uppercase hover:bg-blue-600 transition-colors"
        >
          {listing.type === 'rent' ? 'Reservar Ahora' : 'Comprar Ahora'}
        </button>
      </div>

      {/* Popup de confirmación */}
      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg w-80 text-center">
            <p className="text-lg font-semibold text-sah-primary">Confirmar Reserva</p>
            <p className="text-gray-700 mt-2">
              Una vez que acepte, se enviará una solicitud con el tiempo marcado de{' '}
              {rentalDurationMonths} {rentalDurationMonths === 1 ? 'mes' : 'meses'}.
            </p>
            <p className="text-gray-700 mt-2">
              ¿Está seguro que desea enviar la petición?
            </p>
            <div className="mt-4 flex justify-center gap-4">
              <button
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                onClick={handleAccept}
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Aceptar'}
              </button>
              <button
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
