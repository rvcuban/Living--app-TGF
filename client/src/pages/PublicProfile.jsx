import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import {
    FaDog,
    FaSmoking,
    FaSun,
    FaMoon,
    FaCloudSun,
    FaCheckCircle,
    FaMedal,
    FaStar
} from 'react-icons/fa';
import UserReviewModal from '../components/UserReviewModal';

export default function PublicProfile() {
    const { userId } = useParams();
    const { currentUser } = useSelector((state) => state.user);

    const [user, setUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    // Estado para saber la relación de compañeros
    // Puede ser: 'none' (sin solicitud), 'pending', 'accepted', 'self' (el mismo user)
    const [buddyStatus, setBuddyStatus] = useState('none');

    const [showReviewModal, setShowReviewModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPublicProfile = async () => {
            try {
                // 1) Datos del usuario
                const res = await fetch(`/api/user/public-profile/${userId}`);
                const data = await res.json();
                if (data.success) {
                    setUser(data.user);
                } else {
                    toast.error(data.message || 'Error al cargar el perfil público.');
                }
            } catch (error) {
                console.error('Error fetching public profile:', error);
                toast.error('Error al obtener el perfil público.');
            }
        };

        const fetchUserReviews = async () => {
            try {
                // 2) Reseñas
                const resReviews = await fetch(`/api/userreview/${userId}`);
                const dataReviews = await resReviews.json();
                if (dataReviews.success) {
                    setReviews(dataReviews.reviews);
                } else {
                    toast.info(dataReviews.message || 'No hay reseñas disponibles.');
                }
            } catch (error) {
                console.error('Error fetching user reviews:', error);
            }
        };

        const fetchBuddyStatus = async () => {
            // Llamar a un endpoint que devuelva la relación
            // Solo si currentUser existe y no es el mismo user
            if (!currentUser || currentUser._id === userId) {
                if (currentUser && currentUser._id === userId) {
                    setBuddyStatus('self');
                }
                return;
            }
            try {
                const res = await fetch(`/api/roommate/status/${userId}`, {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`
                    }
                });
                const data = await res.json();
                if (data.success) {
                    // data.status = 'none' | 'pending' | 'accepted'
                    setBuddyStatus(data.status);
                }
            } catch (error) {
                console.error('Error fetching buddy status:', error);
            }
        };

        setLoading(true);
        Promise.all([
            fetchPublicProfile(),
            fetchUserReviews(),
            fetchBuddyStatus()
        ]).finally(() => setLoading(false));
    }, [userId, currentUser]);

    // Lógica de envío de solicitud
    const handleBeMyRoommate = async () => {
        if (!currentUser) {
            toast.info('Necesitas iniciar sesión para enviar una solicitud.');
            navigate('/sign-in');
            return;
        }
        if (buddyStatus === 'pending' || buddyStatus === 'accepted') {
            return; // Evita reenviar la solicitud
        }

        try {
            const res = await fetch('/api/roommate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${currentUser.token}`,
                },
                body: JSON.stringify({ receiverId: userId }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Solicitud de compañero enviada.');
                setBuddyStatus('pending'); // Cambiamos a 'pending'
            } else {
                toast.error(data.message || 'No se pudo enviar la solicitud.');
            }
        } catch (error) {
            console.error('Error enviando solicitud:', error);
            toast.error('Error enviando la solicitud.');
        }
    };

    if (loading) {
        return <p className="text-center mt-8 text-2xl">Cargando...</p>;
    }

    if (!user) {
        return (
            <p className="text-center mt-8 text-2xl text-red-500">
                Perfil no encontrado.
            </p>
        );
    }

    // Desestructurar user
    const {
        username,
        avatar,
        shortBio,
        preferences,
        badges,
        verified,
        reliability,
        averageRating,
    } = user;

    const getScheduleIcon = (schedule) => {
        switch (schedule) {
            case 'diurno':
                return <FaSun className="text-xl" />;
            case 'nocturno':
                return <FaMoon className="text-xl" />;
            case 'flexible':
                return <FaCloudSun className="text-xl" />;
            default:
                return null;
        }
    };

    const renderBadges = (badgesList = []) => {
        if (!badgesList.length) return null;
        return (
            <div className="flex flex-wrap gap-2 mt-3">
                {badgesList.map((badge, index) => (
                    <span
                        key={`badge-${index}`}
                        className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded-full"
                    >
                        <FaMedal className="text-yellow-500" />
                        {badge}
                    </span>
                ))}
            </div>
        );
    };

    const renderStars = (ratingValue) => {
        const stars = [];
        for (let i = 0; i < 5; i++) {
            stars.push(
                <FaStar
                    key={`star-${i}`}
                    className={i < Math.round(ratingValue) ? 'text-yellow-400' : 'text-gray-300'}
                />
            );
        }
        return stars;
    };

    return (
        <div className="max-w-4xl mx-auto p-4">
            {/* Encabezado con avatar */}
            <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
                <img
                    src={avatar || '/default-profile.png'}
                    alt={`${username || 'Usuario'} avatar`}
                    className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-blue-200"
                />
                <div className="flex flex-col items-center sm:text-center">
                    <h2 className="text-2xl font-bold text-slate-700">
                        {username || 'User'}
                    </h2>
                    {verified && (
                        <div className="flex items-center mt-1 gap-1 text-green-600">
                            <FaCheckCircle />
                            <span className="text-sm font-medium">Verificado</span>
                        </div>
                    )}
                </div>
                {renderBadges(badges)}
                {shortBio && (
                    <p className="text-gray-800 mt-4 text-center italic">{shortBio}</p>
                )}
                {/* Rating Global (usuario) */}
                <div className="mt-4 flex items-center gap-2">
                    <span className="text-slate-700 font-medium">Valoración:</span>
                    <div className="flex items-center">
                        {renderStars(averageRating || 0)}
                    </div>
                    <span className="ml-1 text-gray-500 text-sm">({averageRating || 0})</span>
                </div>

                {/* Preferencias de convivencia */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sah-primary w-full">
                    <div className="flex items-center gap-2 justify-center">
                        <FaDog className="text-xl" />
                        <span>
                            {preferences?.pets ? 'Amo/acepto mascotas' : 'No acepto mascotas'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                        <FaSmoking className="text-xl" />
                        <span>
                            {preferences?.smoker ? 'Fumador' : 'No fumador'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                        {getScheduleIcon(preferences?.schedule)}
                        <span>
                            {preferences?.schedule ? `Horario: ${preferences.schedule}` : 'Horario no especificado'}
                        </span>
                    </div>
                </div>

                <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-center">
                    {/* Botón "Sé mi compañero" */}
                    {currentUser && currentUser._id !== userId && buddyStatus !== 'self' && (
                        <>
                            {buddyStatus === 'none' && (
                                <button
                                    onClick={handleBeMyRoommate}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                                >
                                    Sé mi compañero
                                </button>
                            )}
                            {buddyStatus === 'pending' && (
                                <button
                                    disabled
                                    className="bg-gray-400 text-white px-4 py-2 rounded cursor-not-allowed"
                                >
                                    Solicitud enviada...
                                </button>
                            )}
                            {buddyStatus === 'accepted' && (
                                <button
                                    disabled
                                    className="bg-green-500 text-white px-4 py-2 rounded cursor-not-allowed"
                                >
                                    Ya son compañeros
                                </button>
                            )}
                        </>
                    )}

                    {/* Botón Enviar Mensaje */}
                    <Link
                        to={`/chat?otherUserId=${userId}&prefilled=Hola,he visto tu perfil y `}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                        Enviar Mensaje
                    </Link>
                </div>
            </div>

            {/* Reseñas que ha recibido */}
            <div className="mt-6 bg-white shadow-md p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-700 mb-3">
                    Reseñas de {username}
                </h3>
                {/* Botón para abrir modal de reseña */}
                <div className="mt-4 mb-2">
                    <button
                        onClick={() => setShowReviewModal(true)}
                        className="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                        Escribir reseña
                    </button>
                </div>

                {reviews && reviews.length > 0 ? (
                    <ul className="space-y-4">
                        {reviews.map((review, idx) => (
                            <li
                                key={review._id || `review-${idx}`}
                                className="border-b pb-3 last:border-b-0 last:pb-0"
                            >
                                <div className="flex items-start">
                                    <img
                                        src={review.author?.avatar || '/default-profile.png'}
                                        alt="autor avatar"
                                        className="w-8 h-8 rounded-full mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-slate-800">
                                                {review.author?.username || 'Usuario Anónimo'}
                                            </p>
                                            <div className="flex items-center">
                                                {renderStars(review.rating)}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 mt-1">
                                            {review.comment || 'Sin comentario'}
                                        </p>
                                        <span className="text-xs text-gray-400">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500">Aún no hay reseñas para este perfil.</p>
                )}

                <UserReviewModal
                    visible={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    targetUserId={userId}
                    currentUserToken={currentUser?.token}
                    onReviewCreated={(newReview) => setReviews((prev) => [newReview, ...prev])}
                />
            </div>

            {/* CTA para enviar mensaje */}
            <div className="mt-6 bg-white shadow-md p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    ¿Quieres contactar con {username}?
                </h3>
                <p className="text-gray-600">
                    Puedes enviar un mensaje si deseas más información.
                </p>
                <Link
                    to={`/messages/${userId}`}
                    className="inline-block mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                    Enviar Mensaje
                </Link>
            </div>
        </div>
    );
}
