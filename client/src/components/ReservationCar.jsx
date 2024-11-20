// src/components/ReservationCard.jsx

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

export default function ReservationCard({ listingType, listingId, onReserve }) {
    const [rentalDuration, setRentalDuration] = useState(3);
    const [showPopup, setShowPopup] = useState(false); // Estado para mostrar el popup
    const [loading, setLoading] = useState(false); // Estado para manejar el loading

    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();

    const handleReservationSubmit = () => {
        // Mostrar el popup para confirmar el tiempo seleccionado
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
                    // Asegúrate de que el backend maneje la autenticación por tokens
                    'Authorization': `Bearer ${currentUser.token}`,
                },
                body: JSON.stringify({ listingId: listingId, rentalDuration }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Aplicación enviada exitosamente.");
                setShowPopup(false);
                if (onReserve) onReserve(); // Función opcional para manejar después de la reserva
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
        setShowPopup(false); // Cerrar el popup si cancela
    };

    const handleDurationChange = (event) => {
        setRentalDuration(event.target.value);
    };

    return (
        <div className="bg-white p-6 shadow-lg rounded-lg mt-6 border border-gray-300 relative">
            <h3 className="text-3xl font-bold text-center mb-4">
                {listingType === 'rent' ? 'Reserva Ahora' : 'Comprar Ahora'}
            </h3>
            {listingType === 'rent' && (
                <select
                    className="w-full p-3 mt-3 border border-gray-300 rounded-lg bg-slate-100 text-slate-600"
                    value={rentalDuration}
                    onChange={handleDurationChange}
                >
                    {[3, 6, 9, 12].map((months) => (
                        <option key={months} value={months}>
                            {months} {months === 1 ? 'mes' : 'meses'}
                        </option>
                    ))}
                </select>
            )}
            <button
                className="bg-blue-600 text-white w-full p-3 mt-6 rounded-lg hover:bg-blue-500 transition-colors"
                onClick={handleReservationSubmit}
                disabled={loading}
            >
                {listingType === 'rent' ? 'Reserva Ahora' : 'Contactar para Comprar'}
            </button>

            {/* Popup de confirmación */}
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg w-80 text-center">
                        <p className="text-lg font-semibold text-sah-primary">Confirmar Reserva</p>
                        <p className="text-gray-700 mt-2">
                            Una vez que acepte, se enviará una solicitud de entrada con el tiempo marcado de {rentalDuration} {rentalDuration === 1 ? 'mes' : 'meses'}.
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
