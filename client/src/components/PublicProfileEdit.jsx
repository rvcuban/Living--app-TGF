import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import {
  FaDog,
  FaSmoking,
  FaSun,
  FaMoon,
  FaCloudSun,
  FaCheckCircle,
  FaMedal,
  FaStar,
} from 'react-icons/fa';
import UserReviewModal from '../components/UserReviewModal';
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
} from '../redux/user/userSlice';

/** Componente Tabs para manejar las pestañas */
function Tabs({ tabs, defaultTab, children }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const tabContainerRef = useRef(null);

  useEffect(() => {
    const activeButton = tabContainerRef.current?.querySelector('.active-tab');
    if (activeButton) {
      activeButton.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  }, [activeTab]);

  return (
    <div>
      <div
        ref={tabContainerRef}
        className="flex overflow-x-auto whitespace-nowrap border-b scrollbar-hide"
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              console.log("Cambiando pestaña a:", tab);
              setActiveTab(tab);
            }}
            className={`flex-shrink-0 py-2 px-4 font-medium transition-colors focus:outline-none ${
              activeTab === tab
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

/** Componente para editar el perfil público (modo edición permanente).
 * Permite modificar la información básica, preferencias, intereses y galería.
 * En la pestaña "Galería", permite seleccionar múltiples videos para eliminarlos.
 */
export default function PublicProfileEdit() {
  const { userId } = useParams();
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  // buddyStatus no se usa en edición
  const [buddyStatus] = useState('none');
  const [showReviewModal, setShowReviewModal] = useState(false);
  // Para la eliminación múltiple de videos
  const [selectedVideos, setSelectedVideos] = useState([]);

  useEffect(() => {
    // Definimos el ID a utilizar: si viene en la URL, lo usamos; sino, usamos el id del currentUser
    const effectiveId = userId || currentUser?._id;
    console.log("EffectiveId para cargar perfil:", effectiveId);
    if (!effectiveId) {
      toast.error('No se pudo determinar el usuario a cargar.');
      setLoading(false);
      return;
    }

    const fetchPublicProfile = async () => {
      try {
        const res = await fetch(`/api/user/public-profile/${effectiveId}`);
        const data = await res.json();
        console.log("Respuesta de public-profile:", data);
        if (data.success) {
          setUser(data.user);
          setEditUser(structuredClone(data.user));
          console.log("User cargado:", data.user);
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
        const resReviews = await fetch(`/api/userreview/${effectiveId}`);
        const dataReviews = await resReviews.json();
        console.log("Respuesta de user reviews:", dataReviews);
        if (dataReviews.success) {
          setReviews(dataReviews.reviews);
        } else {
          toast.info(dataReviews.message || 'No hay reseñas disponibles.');
        }
      } catch (error) {
        console.error('Error fetching user reviews:', error);
      }
    };

    setLoading(true);
    Promise.all([fetchPublicProfile(), fetchUserReviews()])
      .finally(() => {
        setLoading(false);
        console.log("Loading finalizado. user:", user, " editUser:", editUser);
      });
  }, [userId, currentUser]);

  if (loading) {
    console.log("Mostrando loading...");
    return <p className="text-center mt-8 text-2xl">Cargando...</p>;
  }

  if (!user) {
    console.log("User es null");
    return (
      <p className="text-center mt-8 text-2xl text-red-500">
        Perfil no encontrado.
      </p>
    );
  }

  // Desestructuramos datos del usuario original
  const { username, avatar, shortBio, preferences, badges } = user;
  console.log("Datos del usuario:", { username, avatar, shortBio, preferences, badges });

  // Helper: obtener icono según horario
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

  // --- Handlers para modo edición ---
  const handleEditChange = (field, value) => {
    console.log(`Cambiando ${field} a:`, value);
    setEditUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePrefChange = (field, value) => {
    console.log(`Cambiando preferencia ${field} a:`, value);
    setEditUser((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value,
      },
    }));
  };

  const handleAddInterest = (interest) => {
    if (!interest) return;
    console.log("Añadiendo interés:", interest);
    setEditUser((prev) => ({
      ...prev,
      interests: [...(prev.interests || []), interest],
    }));
  };

  const handleRemoveInterest = (interest) => {
    console.log("Eliminando interés:", interest);
    setEditUser((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  const handleAddImage = (imageUrl) => {
    if (!imageUrl) return;
    console.log("Añadiendo imagen:", imageUrl);
    setEditUser((prev) => ({
      ...prev,
      gallery: [...(prev.gallery || []), imageUrl],
    }));
  };

  const handleRemoveImage = (imageUrl) => {
    console.log("Eliminando imagen:", imageUrl);
    setEditUser((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((url) => url !== imageUrl),
    }));
  };

  const handleAddVideo = (videoUrl) => {
    if (!videoUrl) return;
    console.log("Añadiendo video:", videoUrl);
    setEditUser((prev) => ({
      ...prev,
      videos: [...(prev.videos || []), videoUrl],
    }));
  };

  const handleRemoveVideo = (videoUrl) => {
    console.log("Eliminando video:", videoUrl);
    setEditUser((prev) => ({
      ...prev,
      videos: prev.videos.filter((url) => url !== videoUrl),
    }));
    setSelectedVideos((prev) => prev.filter((url) => url !== videoUrl));
  };

  const handleToggleVideoSelection = (videoUrl) => {
    console.log("Toggle selection de video:", videoUrl);
    setSelectedVideos((prev) =>
      prev.includes(videoUrl)
        ? prev.filter((url) => url !== videoUrl)
        : [...prev, videoUrl]
    );
  };

  const handleRemoveSelectedVideos = () => {
    console.log("Eliminando videos seleccionados:", selectedVideos);
    if (selectedVideos.length === 0) return;
    setEditUser((prev) => ({
      ...prev,
      videos: prev.videos.filter((url) => !selectedVideos.includes(url)),
    }));
    setSelectedVideos([]);
  };

  // Guardar cambios en el backend
  const handleSaveEdits = async () => {
    if (!currentUser) return;
    try {
      dispatch(updateUserStart());
      const effectiveId = currentUser?._id || user?._id;
      console.log("Guardando cambios para el usuario con id:", effectiveId);
      const res = await fetch(`/api/user/update/${effectiveId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUser),
      });
      const data = await res.json();
      console.log("Respuesta de updateUser:", data);
      if (data.success) {
        toast.success('Perfil público actualizado.');
        dispatch(updateUserSuccess(data));
        setUser(data.data);
      } else {
        dispatch(updateUserFailure(data.message || 'Error'));
        toast.error(data.message || 'Error al actualizar tu perfil público.');
      }
    } catch (error) {
      console.error("Error en handleSaveEdits:", error);
      dispatch(updateUserFailure(error.message));
      toast.error('Error de conexión al actualizar el perfil público.');
    }
  };

  // --- Renderizado de las pestañas ---

  // Pestaña "Sobre mí" – Edición de información básica, preferencias e intereses
  const renderAboutTab = () => (
    <div className="p-4 space-y-4">
      <div>
        <label className="block font-semibold text-gray-700">Biografía:</label>
        <textarea
          rows={3}
          className="border rounded w-full p-2"
          value={editUser.shortBio || ''}
          onChange={(e) => handleEditChange('shortBio', e.target.value)}
        />
      </div>
      <div>
        <label className="block font-semibold text-gray-700">Ubicación:</label>
        <input
          type="text"
          className="border rounded w-full p-2"
          value={editUser.location || ''}
          onChange={(e) => handleEditChange('location', e.target.value)}
        />
      </div>
      <div>
        <p className="font-semibold text-gray-700">Preferencias:</p>
        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={editUser.preferences?.pets || false}
            onChange={(e) => handlePrefChange('pets', e.target.checked)}
          />
          Acepta mascotas
        </label>
        <label className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={editUser.preferences?.smoker || false}
            onChange={(e) => handlePrefChange('smoker', e.target.checked)}
          />
          Fumador
        </label>
        <div className="mt-2">
          <span>Horario:</span>{' '}
          <select
            value={editUser.preferences?.schedule || ''}
            onChange={(e) => handlePrefChange('schedule', e.target.value)}
            className="border p-1 rounded"
          >
            <option value="diurno">Diurno</option>
            <option value="nocturno">Nocturno</option>
            <option value="flexible">Flexible</option>
          </select>
        </div>
      </div>
      <div>
        <p className="font-semibold text-gray-700">Mis intereses</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {(editUser.interests || []).map((interest) => (
            <span
              key={interest}
              className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center"
            >
              {interest}
              <button
                className="ml-2 text-red-500"
                onClick={() => handleRemoveInterest(interest)}
              >
                x
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            id="newInterest"
            placeholder="Nuevo interés..."
            className="border rounded p-1"
          />
          <button
            onClick={() => {
              const val = document.getElementById('newInterest').value.trim();
              if (val) handleAddInterest(val);
              document.getElementById('newInterest').value = '';
            }}
            className="bg-blue-500 text-white px-2 py-1 rounded"
          >
            Añadir
          </button>
        </div>
      </div>
    </div>
  );

  // Pestaña "Galería" – Edición de imágenes y videos (con selección múltiple para videos)
  const renderGalleryTab = () => {
    // Aquí siempre estamos en modo edición en este componente
    return (
      <div className="p-4 space-y-4">
        {/* Sección de imágenes */}
        <p className="font-semibold">Galería de Imágenes</p>
        <div className="flex flex-wrap gap-2">
          {(editUser.gallery || []).map((imgUrl) => (
            <div key={imgUrl} className="relative w-20 h-28 bg-black">
              <img
                src={imgUrl}
                alt="gallery"
                className="absolute inset-0 object-cover w-full h-full"
              />
              <button
                className="absolute top-0 right-0 bg-red-600 text-white px-1 rounded"
                onClick={() => handleRemoveImage(imgUrl)}
              >
                x
              </button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            id="newImageUrl"
            placeholder="URL de imagen"
            className="border p-1 rounded mr-2 w-64"
          />
          <button
            onClick={() => {
              const val = document.getElementById('newImageUrl').value.trim();
              if (val) handleAddImage(val);
              document.getElementById('newImageUrl').value = '';
            }}
            className="bg-blue-500 text-white px-2 py-1 rounded"
          >
            Añadir imagen
          </button>
        </div>

        {/* Sección de videos */}
        <p className="font-semibold mt-4">Videos</p>
        <div className="flex flex-wrap gap-2">
          {(editUser.videos || []).map((vidUrl) => {
            const isSelected = selectedVideos.includes(vidUrl);
            return (
              <div
                key={vidUrl}
                className={`relative w-20 h-36 bg-black border-2 ${
                  isSelected ? 'border-blue-500' : 'border-transparent'
                }`}
                onClick={() => handleToggleVideoSelection(vidUrl)}
              >
                <video
                  src={vidUrl}
                  preload="metadata"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <button
                  className="absolute top-0 right-0 bg-red-600 text-white px-1 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveVideo(vidUrl);
                  }}
                >
                  x
                </button>
              </div>
            );
          })}
        </div>
        {selectedVideos.length > 0 && (
          <button
            onClick={handleRemoveSelectedVideos}
            className="mt-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
          >
            Eliminar videos seleccionados
          </button>
        )}
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            id="newVideoUrl"
            placeholder="URL de video"
            className="border p-1 rounded mr-2 w-64"
          />
          <button
            onClick={() => {
              const val = document.getElementById('newVideoUrl').value.trim();
              if (val) handleAddVideo(val);
              document.getElementById('newVideoUrl').value = '';
            }}
            className="bg-blue-500 text-white px-2 py-1 rounded"
          >
            Añadir video
          </button>
        </div>
      </div>
    );
  };

  // Pestaña "Opiniones" – Solo lectura
  const renderReviewsTab = () => {
    const totalReviews = reviews ? reviews.length : 0;
    const averageRatingDynamic =
      totalReviews > 0
        ? (reviews.reduce((acc, review) => acc + review.rating, 0) / totalReviews).toFixed(1)
        : null;

    return (
      <div className="p-4">
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

  console.log("Renderizando PublicProfileEdit. user:", user, " editUser:", editUser, " selectedVideos:", selectedVideos);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* CABECERA CON AVATAR E INFORMACIÓN BÁSICA */}
      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
        <img
          src={avatar || '/default-profile.png'}
          alt={`${username || 'Usuario'} avatar`}
          className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-blue-200"
        />
        <div className="flex flex-col items-center sm:text-center">
          <h2 className="text-2xl font-bold text-slate-700">{username || 'User'}</h2>
          
        </div>
        {renderBadges(badges)}
        <p className="text-gray-800 mt-4 text-center italic">{user.shortBio}</p>
        <div className="mt-4 flex items-center gap-2">
          <span className="text-slate-700 font-medium">Valoración:</span>
          <div className="flex items-center">{renderStars(user.averageRating || 0)}</div>
          <span className="ml-1 text-gray-500 text-sm">({user.reviewsCount || 0})</span>
        </div>
        {/* Botones para guardar o descartar cambios */}
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSaveEdits}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Guardar
          </button>
          <button
            onClick={() => {
              console.log("Cancelando cambios, restaurando editUser a:", user);
              setEditUser(structuredClone(user));
            }}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            Cancelar
          </button>
        </div>
      </div>

      {/* Sección de pestañas */}
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
    </div>
  );
}
