import React, { useEffect, useState, useRef } from 'react';
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

// Componente simple para pestañas
function Tabs({ tabs, defaultTab, children }) {
    const [activeTab, setActiveTab] = useState(defaultTab);
    const tabContainerRef = useRef(null);

    // Cuando activeTab cambia, se desplaza el botón activo a la vista.
    useEffect(() => {
        const activeButton = tabContainerRef.current.querySelector('.active-tab');
        if (activeButton) {
            activeButton.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }
    }, [activeTab]);

    return (
        <div>
            {/* Contenedor de pestañas con desplazamiento horizontal */}
            <div ref={tabContainerRef} className="flex overflow-x-auto whitespace-nowrap border-b scrollbar-hide">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-shrink-0 py-2 px-4 font-medium transition-colors focus:outline-none ${activeTab === tab
                            ? 'active-tab border-blue-500 text-blue-500 border-b-2'
                            : 'border-transparent text-gray-500 hover:text-blue-500'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>
            <div className="mt-4">
                {React.Children.toArray(children).find(
                    (child) => child.props.value === activeTab
                )}
            </div>
        </div>
    );
}

export default function PublicProfile() {
    const { userId } = useParams();
    const { currentUser } = useSelector((state) => state.user);

    const [user, setUser] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [buddyStatus, setBuddyStatus] = useState('none'); // 'none', 'pending', 'accepted', 'self'
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
                console.log("Respuesta del endpoint de reseñas:", dataReviews);
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

    const handleBeMyRoommate = async () => {
        if (!currentUser) {
            toast.info('Necesitas iniciar sesión para enviar una solicitud.');
            navigate('/sign-in');
            return;
        }
        if (buddyStatus === 'pending' || buddyStatus === 'accepted') {
            return;
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
                setBuddyStatus('pending');
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

    // Desestructurar datos del usuario
    const { username, avatar, shortBio, preferences, badges, verified, averageRating } = user;

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
                    <span key={`badge-${index}`} className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-sm px-2 py-1 rounded-full">
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
                <FaStar key={`star-${i}`} className={i < Math.round(ratingValue) ? 'text-yellow-400' : 'text-gray-300'} />
            );
        }
        return stars;
    };

    const handleReviewCreated = (newReview) => {
        setReviews((prev) => [newReview, ...prev]);
        const totalRating = (user.averageRating * reviews.length) + newReview.rating;
        const newAverage = totalRating / (reviews.length + 1);
        const newReviewsCount = reviews.length + 1;
        setUser((prevUser) => ({
            ...prevUser,
            averageRating: newAverage,
            reviewsCount: newReviewsCount,
        }));
    };

    // Funciones para renderizar cada pestaña
    const renderAboutTab = () => (
        <div className="p-4">
            {/* Información básica “Sobre mí” */}
            {user.shortBio ? (
                <p className="text-gray-700">{user.shortBio}</p>
            ) : (
                <p className="text-gray-700">No hay información sobre el usuario.</p>
            )}

            <div className="mt-4">
                <p className="text-gray-600">
                    <strong>Buscando compi en:</strong> {user.location || 'No especificada'}
                </p>
                <p className="text-gray-600">
                    <strong>Preferencias:</strong>{' '}
                    {user.preferences ? (
                        <>
                            {user.preferences.pets ? 'Acepta mascotas. ' : 'No acepta mascotas. '}
                            {user.preferences.smoker ? 'Fumador. ' : 'No fumador. '}
                            {user.preferences.schedule ? `Horario: ${user.preferences.schedule}` : ''}
                        </>
                    ) : (
                        'Sin preferencias definidas.'
                    )}
                </p>
            </div>

            {/* Información de los intereses (lo que había en renderInterestsTab) */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Mis intereses</h3>
                <div className="flex flex-wrap gap-2">
                    {user.interests && user.interests.length > 0 ? (
                        user.interests.map((interest, idx) => (
                            <span key={idx} className="bg-gray-200 px-2 py-1 rounded-full text-sm">
                                {interest}
                            </span>
                        ))
                    ) : (
                        <p className="text-gray-500">No se han definido intereses.</p>
                    )}
                </div>
            </div>
        </div>
    );

    // Dentro de tu componente PublicProfile, agrega la siguiente función:

     // Función para iniciar o reanudar una conversación
     const handleStartChat = async () => {
        if (!currentUser) {
          toast.info('Debes iniciar sesión para enviar mensajes.');
          navigate('/sign-in');
          return;
        }
        try {
          const res = await fetch('/api/chat/start', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${currentUser.token}`,
            },
            body: JSON.stringify({
              receiverId: userId,
              content: "Hola, he visto tu perfil y...", // mensaje predefinido
            }),
          });
          const data = await res.json();
          if (data.success) {
            // Redirige a la conversación recién iniciada (o existente)
            navigate(`/chat/${data.conversationId}`);
          } else {
            toast.error(data.message || 'Error al iniciar la conversación.');
          }
        } catch (error) {
          toast.error(error.message);
        }
      };




    const renderReviewsTab = () => {
        console.log('Reseñas cargadas:', reviews);
        const totalReviews = reviews ? reviews.length : 0;
        const averageRatingDynamic =
            totalReviews > 0
                ? (reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1)
                : null;

        return (
            <div className="p-4">
                {/* Sección de calificación global */}
                <div className="flex items-center mb-4">
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <FaStar
                                key={star}
                                className={
                                    star <= Math.round(averageRatingDynamic || 0)
                                        ? 'w-5 h-5 text-yellow-400'
                                        : 'w-5 h-5 text-gray-300'
                                }
                            />
                        ))}
                    </div>
                    <span className="ml-2 text-gray-600">
                        {averageRatingDynamic
                            ? `${averageRatingDynamic} de 5 (${totalReviews} valoraciones)`
                            : 'Sin valoraciones'}
                    </span>
                </div>

                {/* Lista de reseñas */}
                {totalReviews > 0 ? (
                    <ul className="space-y-4">
                        {reviews.map((review) => (
                            <li key={review._id} className="border-b pb-3">
                                <div className="flex items-start">
                                    <img
                                        src={review.author?.avatar || '/default-profile.png'}
                                        alt="avatar"
                                        className="w-8 h-8 rounded-full mr-3"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold text-gray-800">
                                                {review.author?.username || 'Usuario Anónimo'}
                                            </p>
                                            <div className="flex items-center">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <FaStar
                                                        key={star}
                                                        className={
                                                            star <= Math.round(review.rating)
                                                                ? 'w-5 h-5 text-yellow-400'
                                                                : 'w-5 h-5 text-gray-300'
                                                        }
                                                    />
                                                ))}
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

                {/* Botón para abrir el modal de crear reseña */}
                <div className="mt-4 text-center">
                    <button
                        onClick={() => setShowReviewModal(true)}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                        Escribir reseña
                    </button>
                </div>
            </div>
        );
    };

    const renderGalleryTab = () => {
        // 1. Combinar ambos arrays en uno
        const imagesArray = (user.gallery || []).map((url) => ({
            type: 'image',
            url,
        }));
        const videosArray = (user.videos || []).map((url) => ({
            type: 'video',
            url,
        }));
        const mediaItems = [...imagesArray, ...videosArray];

        // 2. Si no hay nada, mensaje
        if (!mediaItems.length) {
            return (
                <div className="p-4">
                    <p className="text-gray-500">No hay imágenes ni videos en la galería.</p>
                </div>
            );
        }
        // 3. Rejilla estilo TikTok
        return (
            <div className="p-4 grid grid-cols-3 gap-1 sm:gap-2 md:gap-3">
                {mediaItems.map((item, idx) => (
                    <div
                        key={idx}
                        className="relative aspect-[9/16] overflow-hidden rounded bg-black"
                    >
                        {item.type === 'image' ? (
                            <img
                                src={item.url}
                                alt={`media-${idx}`}
                                className="absolute inset-0 w-full h-full object-cover"
                            />
                        ) : (
                            <video
                                preload="metadata"
                                className="absolute inset-0 w-full h-full object-cover"
                                controls
                            >
                                <source src={item.url} type="video/mp4" />
                                Tu navegador no soporta la reproducción de video.
                            </video>
                        )}
                    </div>
                ))}
            </div>
        );
    }; // <--- CERRAR AQUÍ la función

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
                        {renderStars(user.averageRating || 0)}
                    </div>
                    <span className="ml-1 text-gray-500 text-sm">({user.reviewsCount || 0})</span>
                </div>
                {/* Preferencias de convivencia */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sah-primary w-full">
                    <div className="flex items-center gap-2 justify-center">
                        <FaDog className="text-xl" />
                        <span>{preferences?.pets ? 'Acepto mascotas' : 'No acepto mascotas'}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                        <FaSmoking className="text-xl" />
                        <span>{preferences?.smoker ? 'Fumador' : 'No fumador'}</span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                        {getScheduleIcon(preferences?.schedule)}
                        <span>{preferences?.schedule ? `Horario en casa: ${preferences.schedule}` : 'Horario no especificado'}</span>
                    </div>
                </div>
                <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-center">
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
                    <button
                        onClick={handleStartChat}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                    >
                        Enviar Mensaje
                    </button>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden">
                <Tabs tabs={['Sobre mí', 'Galería', 'Opiniones']} defaultTab="Sobre mí">
                    <div value="Sobre mí">{renderAboutTab()}</div>
                    <div value="Galería">{renderGalleryTab()}</div>
                    <div value="Opiniones">{renderReviewsTab()}</div>
                </Tabs>
                <UserReviewModal
                    visible={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    targetUserId={userId}
                    currentUserToken={currentUser?.token}
                    onReviewCreated={handleReviewCreated}
                />
            </div>

            {/* CTA Section */}
            <div className="mt-6 bg-white shadow-md rounded-lg text-center p-4">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    ¿Quieres contactar con {username}?
                </h3>
                <p className="text-gray-600">Puedes enviar un mensaje si deseas más información.</p>
                <button
                    onClick={handleStartChat}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                    Enviar Mensaje
                </button>

            </div>
        </div>
    );
}
