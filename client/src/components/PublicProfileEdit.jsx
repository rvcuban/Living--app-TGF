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
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { app } from '../firebase'; // Ajusta la importación de tu configuración Firebase

/** Componente Tabs para manejar las pestañas */
function Tabs({ tabs, defaultTab, children, className = '' }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const tabContainerRef = useRef(null);

  useEffect(() => {
    const activeButton = tabContainerRef.current?.querySelector('.active-tab');
    if (activeButton) {
      activeButton.scrollIntoView({ behavior: 'smooth', inline: 'center' });
    }
  }, [activeTab]);

  return (
    <div className={`w-full ${className}`}>
      {/* Tab headers - make them fit mobile screens */}
      <div className="border-b w-full">
        <div className="flex w-full overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 py-2 text-sm sm:text-base whitespace-nowrap flex-shrink-0
                ${activeTab === tab
                  ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                  : 'text-gray-500 hover:text-gray-700'}
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content - ensure it takes full width */}
      <div className="w-full">
        {React.Children.map(children, child => {
          return child.props.value === activeTab
            ? React.cloneElement(child, { className: 'w-full' })
            : null;
        })}
      </div>
    </div>
  );
}

/** Ejemplo de componente para editar el perfil público (siempre en modo edición).
 *  Incluye “Sobre mí”, “Galería” (con subida de imágenes/videos y selección múltiple para borrado),
 *  y “Opiniones” (solo lectura).
 */
export default function PublicProfileEdit() {
  //eerores que me apso despues de la primera subida 
  // Fix #1: Move Redux selector before using currentUser
  const fullState = useSelector(state => state);
  console.log("FULL REDUX STATE:", fullState);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const params = useParams();
  // Emergency ID recovery from localStorage
  const storedUserId = localStorage.getItem('lastUserId');
  const effectiveId = params.userId || currentUser?._id || storedUserId;


  // Add a proper check for user authentication
  useEffect(() => {
    // If not authenticated and we need authentication
    if (!currentUser && !params.userId) {
      console.log("User not authenticated, redirecting...");
      navigate('/sign-in', { state: { from: '/profile/public' } });
    }

    // Debug log
    console.log("PublicProfileEdit initialized with ID:", effectiveId);
  }, [currentUser, navigate, params.userId, effectiveId]);




  // State variables
  const [user, setUser] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState([]); // Lista de videos seleccionados para eliminación
  const [videoPerc, setVideoPerc] = useState(0);


  // Referencia para el <input> de subida de media
  const mediaRef = useRef(null);


  useEffect(() => {
    // Debug log to see what values we have
    console.log("UserId values:", {
      userId: params.userId,
      currentUserId: currentUser?._id
    });

    if (!effectiveId) {
      setError("No se pudo determinar el usuario a cargar.");
      setLoading(false);
      return;
    }
    // Debug log
    console.log("PublicProfileEdit - ID Check:", {
      paramsUserId: params.userId,
      reduxUserId: currentUser?._id,
      storedUserId,
      effectiveId,
      currentUser: !!currentUser,
      isAuthenticated: !!effectiveId
    });
    if (effectiveId) {
      localStorage.setItem('lastUserId', effectiveId);
    }

    const fetchUserData = async () => {
      try {
        console.log("Fetching user data for:", effectiveId);
        
        const res = await fetch(`/api/user/${effectiveId}`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${currentUser?.token || ''}`
          }
        });
  
        if (!res.ok) {
          throw new Error(`Error loading profile: ${res.status}`);
        }
        
        const data = await res.json();
        console.log("Profile data received:", data);
        
        if (!data || !data._id) {
          throw new Error("Datos de perfil incorrectos o vacíos");
        }
        
        // Initialize all necessary fields with defaults if missing
        const userData = {
          ...data,
          shortBio: data.shortBio || '',
          location: data.location || '',
          preferences: data.preferences || {
            pets: false,
            smoker: false,
            schedule: 'flexible'
          },
          interests: data.interests || [],
          gallery: data.gallery || [],
          videos: data.videos || [],
          badges: data.badges || [],
          averageRating: data.averageRating || 0,
          reviewsCount: data.reviewsCount || 0
        };
        
        // IMPORTANT: Set both states at once to avoid race conditions
        setUser(userData);
        setEditUser(JSON.parse(JSON.stringify(userData)));
        
        // Optional: Fetch reviews
        try {
          const resReviews = await fetch(`/api/userreview/${effectiveId}`);
          if (resReviews.ok) {
            const dataReviews = await resReviews.json();
            if (dataReviews.success) {
              setReviews(dataReviews.reviews || []);
            }
          }
        } catch (reviewError) {
          console.error("Error fetching reviews:", reviewError);
          // Non-critical error, don't fail the component
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setError(error.message || "Error al cargar los datos del perfil");
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [effectiveId, currentUser]);

  // Fix #7: Add early return with proper fallback UI for errors
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error al cargar perfil</h2>
          <p className="mb-4 text-gray-700">{error}</p>
          <p className="mb-6 text-sm text-gray-500">
            Esto puede ocurrir si es un usuario nuevo. Por favor completa tu perfil para continuar.
          </p>

          <div className="flex flex-col md:flex-row gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Intentar de nuevo
            </button>
            <Link to="/" className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state
  if (loading || !user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <p className="text-gray-600 mt-4">Cargando perfil...</p>
        </div>
      </div>
    );
  }



  const { username, avatar, shortBio, badges } = user;

  // Helpers para rating y medallas (puedes adaptarlos a tu gusto)
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

  // Manejadores para About
  const handleEditChange = (field, value) => {
    setEditUser((prev) => ({ ...prev, [field]: value }));
  };
  const handlePrefChange = (field, value) => {
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
    setEditUser((prev) => ({
      ...prev,
      interests: [...(prev.interests || []), interest],
    }));
  };
  const handleRemoveInterest = (interest) => {
    setEditUser((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  // Manejadores de imagen y video en “editUser”
  const handleAddImage = (url) => {
    setEditUser((prev) => ({
      ...prev,
      gallery: [...(prev.gallery || []), url],
    }));
  };
  const handleAddVideo = (url) => {
    setEditUser((prev) => ({
      ...prev,
      videos: [...(prev.videos || []), url],
    }));
  };
  const handleRemoveImage = (imageUrl) => {
    setEditUser((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((url) => url !== imageUrl),
    }));
  };
  const handleRemoveVideo = (videoUrl) => {
    setEditUser((prev) => ({
      ...prev,
      videos: prev.videos.filter((url) => url !== videoUrl),
    }));
    setSelectedVideos((prev) => prev.filter((v) => v !== videoUrl));
  };

  // Subida de archivos (imágenes o videos) a Firebase
  const uploadMedia = async (file) => {
    try {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + '_' + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      const downloadURL = await new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Para videos, actualizamos el progreso

            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            setVideoPerc(Math.round(progress));

          },
          (err) => reject(err),
          () => {
            getDownloadURL(uploadTask.snapshot.ref)
              .then(resolve)
              .catch(reject);
          }
        );
      });

      // Detectar si es imagen o video
      if (file.type.startsWith('image/')) {
        handleAddImage(downloadURL);
        toast.success('Imagen subida correctamente.');
      } else if (file.type.startsWith('video/')) {
        handleAddVideo(downloadURL);
        toast.success('Video subido correctamente.');
      }
    } catch (err) {
      console.error('Error subiendo archivo:', err);
      toast.error('Error subiendo archivo.');
    }
  };

  // Evento al seleccionar archivos
  const handleMediaSelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    for (let i = 0; i < files.length; i++) {
      await uploadMedia(files[i]);
    }
    // Limpia el input para permitir volver a abrir
    e.target.value = '';
  };

  // Lógica para seleccionar/deseleccionar videos para borrado
  const handleToggleVideoSelection = (videoUrl) => {
    if (selectedVideos.includes(videoUrl)) {
      setSelectedVideos((prev) => prev.filter((url) => url !== videoUrl));
    } else {
      setSelectedVideos((prev) => [...prev, videoUrl]);
    }
  };
  const handleRemoveSelectedVideos = () => {
    if (selectedVideos.length === 0) return;
    setEditUser((prev) => ({
      ...prev,
      videos: prev.videos.filter((url) => !selectedVideos.includes(url)),
    }));
    setSelectedVideos([]);
  };

  // Guardar cambios en backend
  const handleSaveEdits = async () => {
    const handleSaveEdits = async () => {
      // Get ID from multiple sources with more robust fallbacks
      const userId = params.userId || currentUser?._id || user?._id || localStorage.getItem('lastUserId');
      
      if (!userId) {
        toast.error('No se pudo identificar al usuario. Por favor, inicie sesión de nuevo.');
        navigate('/sign-in');
        return;
      }
      
      try {
        dispatch(updateUserStart());
        
        // Use the resolved userId directly
        const res = await fetch(`/api/user/update/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentUser?.token || ''}`
          },
          body: JSON.stringify(editUser),
          credentials: 'include'
        });
        
        const data = await res.json();
        if (data.success) {
          // Save the userId for future reference
          localStorage.setItem('lastUserId', userId);
          
          dispatch(updateUserSuccess(data));
          toast.success('Perfil público actualizado.');
          // Actualizamos la info local
          setUser(data);
          setEditUser(data);
        } else {
          dispatch(updateUserFailure(data.message || 'Error'));
          toast.error(data.message || 'Error al actualizar tu perfil público.');
        }
      } catch (err) {
        console.error('Error saving profile:', err);
        dispatch(updateUserFailure(err.message));
        toast.error('Error de conexión al actualizar el perfil público.');
      }
    };
  };

  /** Renders: secciones de las Tabs */

  // Sobre mí
  const renderAboutTab = () => {
    return (
      <div className="p-4 space-y-4 overflow-y-auto max-h-[70vh]">
        {/* Biografía */}
        <div>
          <label className="block font-semibold text-gray-700">Biografía:</label>
          <textarea
            rows={3}
            className="border rounded w-full p-2"
            value={editUser.shortBio || ''}
            onChange={(e) => handleEditChange('shortBio', e.target.value)}
          />
        </div>
        {/* Ubicación */}
        <div>
          <label className="block font-semibold text-gray-700">Busco Compi en:</label>
          <input
            type="text"
            className="border rounded w-full p-2"
            value={editUser.location || ''}
            onChange={(e) => handleEditChange('location', e.target.value)}
          />
        </div>
        {/* Preferencias */}
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
        {/* Intereses */}
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
  };

  // Galería
  const renderGalleryTab = () => {
    // Unificamos imágenes y videos
    const imagesArray = (editUser.gallery || []).map((url) => ({ type: 'image', url }));
    const videosArray = (editUser.videos || []).map((url) => ({ type: 'video', url }));
    const mediaItems = [...imagesArray, ...videosArray];

    return (
      <div className="p-4 space-y-4">
        {/* Botón subir media (imágenes o videos) */}
        <div className="flex gap-2">
          <input
            type="file"
            ref={mediaRef}
            accept="image/*,video/*"
            multiple
            hidden
            onChange={handleMediaSelect}
          />
          <button
            onClick={() => mediaRef.current?.click()}
            className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 transition"
          >
            Añadir media
          </button>
          {/* Botón para eliminar videos seleccionados (si hay) */}
          {selectedVideos.length > 0 && (
            <button
              onClick={handleRemoveSelectedVideos}
              className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition"
            >
              Eliminar videos seleccionados
            </button>
          )}
        </div>

        {/* Barra de progreso para subida de video */}
        {videoPerc > 0 && videoPerc < 100 && (
          <div className="w-full mt-2">
            <div className="bg-gray-200 h-2 rounded">
              <div
                className="bg-blue-500 h-2 rounded"
                style={{ width: `${videoPerc}%`, transition: 'width 0.3s ease-in-out' }}
              ></div>
            </div>
            <p className="text-sm text-center mt-1">Subiendo video: {videoPerc}%</p>
          </div>
        )}

        {/* Mostrar items en grid */}
        {mediaItems.length === 0 ? (
          <p className="text-gray-500">No hay imágenes ni videos en la galería.</p>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3">
            {mediaItems.map((item, idx) => {
              const isVideo = item.type === 'video';
              // Para videos, comprobamos si está seleccionado
              const isSelected = isVideo && selectedVideos.includes(item.url);

              return (
                <div
                  key={idx}
                  className={`relative aspect-[9/16] overflow-hidden rounded bg-black cursor-pointer border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'
                    }`}
                  onClick={() => {
                    if (isVideo) {
                      // Toggle selección solo en videos
                      handleToggleVideoSelection(item.url);
                    }
                  }}
                >
                  {item.type === 'image' ? (
                    <img
                      src={item.url}
                      alt={`media-${idx}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      // Atributos para mejorar experiencia en móvil
                      playsInline
                      webkit-playsinline="true"
                      preload="none"
                      controls
                      controlsList="nodownload"

                      className="absolute inset-0 w-full h-full object-cover"
                    >
                      <source src={item.url} type="video/mp4" />
                      Tu navegador no soporta la reproducción de video.
                    </video>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Opiniones
  const renderReviewsTab = () => {
    const totalReviews = reviews.length;
    const averageRatingDynamic =
      totalReviews > 0
        ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / totalReviews).toFixed(1)
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
                        {[1, 2, 3, 4, 5].map((s) => (
                          <FaStar
                            key={s}
                            className={
                              s <= Math.round(review.rating)
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

        </div>
      </div>
    );
  };

  /** Render principal */
  return (
    <div className="max-w-4xl mx-auto p-2 sm:p-4 mb-16 sm:mb-24">
      {/* Encabezado */}
      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
        <img
          src={avatar || '/default-profile.png'}
          alt={`${username || 'Usuario'} avatar`}
          className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-blue-200"
        />
        <div className="flex flex-col items-center sm:text-center">
          <h2 className="text-2xl font-bold text-slate-700">{username || 'User'}</h2>
          {renderBadges(badges)}
        </div>
        {shortBio && (
          <p className="text-gray-800 mt-4 text-center italic">
            {shortBio}
          </p>
        )}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-slate-700 font-medium">Valoración:</span>
          <div className="flex items-center">
            {renderStars(user.averageRating || 0)}
          </div>
          <span className="ml-1 text-gray-500 text-sm">
            ({user.reviewsCount || 0})
          </span>
        </div>
        {/* Botones de guardar/cancelar */}

      </div>

      {/* Tabs */}
      <div className="mt-6 bg-white shadow-md rounded-lg overflow-hidden w-full">
        <Tabs tabs={['Sobre mí', 'Galería', 'Opiniones']} defaultTab="Sobre mí" className="w-full">
          <div value="Galería">{renderGalleryTab()}</div>
          <div value="Sobre mí">{renderAboutTab()}</div>

          <div value="Opiniones">{renderReviewsTab()}</div>
        </Tabs>

        <div className="mt-6 mb-6 ml-4 flex gap-4">
          <button
            onClick={handleSaveEdits}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Guardar
          </button>
          <button
            onClick={() => setEditUser(structuredClone(user))}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            Cancelar
          </button>
        </div>

        {/* Modal de reseña */}
        <UserReviewModal
          visible={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          targetUserId={params.userId}
          currentUserToken={currentUser?.token}
          // Actualizar la lista local de reseñas si se crea una nueva
          onReviewCreated={(newReview) => {
            setReviews((prev) => [newReview, ...prev]);
            // Recalc average rating
            const totalReviews = reviews.length + 1;
            const sumRatings = (user.averageRating * reviews.length) + newReview.rating;
            const newAverage = sumRatings / totalReviews;
            setUser((prevU) => ({
              ...prevU,
              averageRating: newAverage,
              reviewsCount: totalReviews,
            }));
          }}
        />
      </div>
    </div>
  );
}
