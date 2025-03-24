import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ProfileCompletionModal from './ProfileCompletionModal';

export default function ReservationCard({ listingType, listingId, onReserve }) {
    const [rentalDurationMonths, setRentalDurationMonths] = useState(3);
    const [showPopup, setShowPopup] = useState(false); 
    const [showProfileModal, setShowProfileModal] = useState(false); // New state for profile modal
    const [loading, setLoading] = useState(false);

    const { currentUser } = useSelector((state) => state.user);
    const navigate = useNavigate();

    // Check if user profile is complete for contract generation
    const isProfileComplete = () => {
        if (!currentUser) return false;
        
        const requiredFields = [
            'username',
            'address',
            'numeroIdentificacion',
            'tipoIdentificacion'
        ];
        
        return requiredFields.every(field => 
            currentUser[field] && currentUser[field].toString().trim() !== ''
        );
    };

    const handleReservationSubmit = () => {
        if (!currentUser) {
            toast.info("Por favor, inicia sesión para reservar.");
            navigate('/sign-in');
            return;
        }

        // Check if profile is complete before showing confirmation popup
        if (!isProfileComplete()) {
            setShowProfileModal(true);
        } else {
            // Profile is complete, show confirmation popup
            setShowPopup(true);
        }
    };

    // Handle after profile completion
    const handleProfileComplete = () => {
        setShowProfileModal(false);
        setShowPopup(true); // Show the confirmation popup after profile completion
    };

    const handleAccept = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentUser.token}`,
                },
                body: JSON.stringify({ listingId: listingId, rentalDurationMonths }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Aplicación enviada exitosamente.");
                setShowPopup(false);
                if (onReserve) onReserve();
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
        <div className="bg-white p-6 shadow-lg rounded-lg mt-6 border border-gray-300 relative">
            <h3 className="text-3xl font-bold text-center mb-4">
                {listingType === 'rent' ? 'Reserva Ahora' : 'Comprar Ahora'}
            </h3>
            {listingType === 'rent' && (
                <div className="mt-3">
                <label htmlFor="rentalDuration" className="block text-slate-600 mb-1">
                  Duración del alquiler (meses):
                </label>
                <input
                  id="rentalDuration"
                  type="number"
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-slate-100 text-slate-600"
                  value={rentalDurationMonths}
                  onChange={(e) => setRentalDurationMonths(Number(e.target.value))}
                />
              </div>
            )}
            <button
                className="bg-blue-600 text-white w-full p-3 mt-6 rounded-lg hover:bg-blue-500 transition-colors"
                onClick={handleReservationSubmit}
                disabled={loading}
            >
                {listingType === 'rent' ? 'Reserva Ahora' : 'Contactar para Comprar'}
            </button>

            {/* Profile Completion Modal */}
            {showProfileModal && (
                <ProfileCompletionModal
                    onComplete={handleProfileComplete}
                    onCancel={() => setShowProfileModal(false)}
                />
            )}

            {/* Confirmation Popup */}
            {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                    <div className="bg-white border border-gray-300 p-6 rounded-lg shadow-lg w-80 text-center">
                        <p className="text-lg font-semibold text-blue-600">Confirmar Reserva</p>
                        <p className="text-gray-700 mt-2">
                            Una vez que acepte, se enviará una solicitud de entrada con el tiempo marcado de {rentalDurationMonths} {rentalDurationMonths === 1 ? 'mes' : 'meses'}.
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