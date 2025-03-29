import { useDispatch, useSelector } from "react-redux";
import { useRef, useState, useEffect } from 'react';
import { getStorage, ref, getDownloadURL, uploadBytesResumable } from 'firebase/storage';
import { app } from '../firebase';
import { updateUserStart, updateUserSuccess, updateUserFailure, deleteUserFailure, deleteUserStart, deleteUserSuccess, signOutUserStart } from '../redux/user/userSlice';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUser, FaIdCard, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaBirthdayCake, FaFlag, FaBriefcase, FaUserFriends, FaPen, FaSave, FaTrash, FaSignOutAlt, FaUpload, FaVideo, FaCheck, FaInfoCircle } from 'react-icons/fa';

function ProfileContent() {
  const fileRef = useRef(null);
  const videoRef = useRef(null);
  const { currentUser, loading } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [videoFile, setVideoFile] = useState(undefined);
  const [videoPerc, setVideoPerc] = useState(0);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [videoUploadError, setVideoUploadError] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // State for form data - initialize with all user fields
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    avatar: currentUser?.avatar || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    location: currentUser?.location || '',
    numeroIdentificacion: currentUser?.numeroIdentificacion || '',
    tipoIdentificacion: currentUser?.tipoIdentificacion || '',
    fullLegalName: currentUser?.fullLegalName || '',
    nationality: currentUser?.nationality || 'España',
    dateOfBirth: currentUser?.dateOfBirth ? new Date(currentUser.dateOfBirth).toISOString().split('T')[0] : '',
    occupation: currentUser?.occupation || '',
    gender: currentUser?.gender || '',
    shortBio: currentUser?.shortBio || '',
    rol: currentUser?.rol || 'Sin Rol',
    // Emergency contact
    emergencyContact: {
      name: currentUser?.emergencyContact?.name || '',
      relationship: currentUser?.emergencyContact?.relationship || '',
      phone: currentUser?.emergencyContact?.phone || ''
    },
    // Preferences
    preferences: {
      pets: currentUser?.preferences?.pets || false,
      smoker: currentUser?.preferences?.smoker || false,
      schedule: currentUser?.preferences?.schedule || ''
    },
    // Videos are handled separately
    videos: currentUser?.videos || [],
    // Contract preferences
    contractPreferences: {
      preferredDuration: currentUser?.contractPreferences?.preferredDuration || 12,
      moveInDateFlexibility: currentUser?.contractPreferences?.moveInDateFlexibility || true
    }
  });

  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);
  const dispatch = useDispatch();

  // Handle file upload for avatar
  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(true);
        toast.error('Error al subir la imagen. Inténtalo de nuevo.');
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
        toast.success('Avatar actualizado exitosamente.');
      }
    );
  };

  // Handle file upload for video
  useEffect(() => {
    if (videoFile) {
      handleVideoUpload(videoFile);
    }
  }, [videoFile]);

  const handleVideoUpload = (file) => {
    const storage = getStorage(app);
    const fileName = new Date().getTime() + "_" + file.name;
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setVideoPerc(Math.round(progress));
      },
      (error) => {
        setVideoUploadError(true);
        toast.error("Error al subir el video. Inténtalo de nuevo.");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          fetch(`/api/user/${currentUser._id}/videos`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ videos: [downloadURL] }),
          })
            .then((res) => res.json())
            .then((data) => {
              if (data.success) {
                setFormData((prev) => ({
                  ...prev,
                  videos: data.data.videos,
                }));
                toast.success("Video subido y actualizado correctamente.");
              } else {
                toast.error(data.message || "Error al actualizar videos.");
              }
            })
            .catch((error) => {
              toast.error("Error al actualizar videos.");
            });
        });
      }
    );
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id.includes('.')) {
      // Handle nested properties (e.g., preferences.pets)
      const [parent, child] = id.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      // Handle top-level properties
      setFormData({
        ...formData,
        [id]: type === 'checkbox' ? checked : value
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        toast.error(data.message || 'Error al actualizar el perfil.');
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      toast.success('Perfil actualizado exitosamente.');

      // Update localStorage
      localStorage.setItem('currentUser', JSON.stringify({
        ...currentUser,
        ...data
      }));
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  // Handle user deletion
  const handleDeleteUser = async () => {
    if (window.confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) {
      try {
        dispatch(deleteUserStart());
        const res = await fetch(`/api/user/delete/${currentUser._id}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success === false) {
          dispatch(deleteUserFailure(data.message));
          return;
        }
        dispatch(deleteUserSuccess(data));
      } catch (error) {
        dispatch(deleteUserFailure(error.message));
      }
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  // Handle showing user listings
  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }

      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  // Handle listing deletion
  const handleListingDelete = async (listingId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar esta propiedad?")) {
      try {
        const res = await fetch(`/api/listing/delete/${listingId}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (data.success === false) {
          console.log(data.message);
          return;
        }

        setUserListings((prev) =>
          prev.filter((listing) => listing._id !== listingId)
        );
        toast.success("Propiedad eliminada correctamente");
      } catch (error) {
        console.log(error.message);
      }
    }
  };

  // Check if required contract fields are complete
  const isProfileCompleteForContract = () => {
    const requiredFields = [
      'username',
      'address',
      'numeroIdentificacion',
      'tipoIdentificacion'
    ];

    return requiredFields.every(field =>
      formData[field] && formData[field].toString().trim() !== ''
    );
  };

  // Get missing contract fields
  const getMissingContractFields = () => {
    const requiredFields = [
      { name: 'username', label: 'Nombre completo' },
      { name: 'address', label: 'Dirección' },
      { name: 'numeroIdentificacion', label: 'Número de identificación' },
      { name: 'tipoIdentificacion', label: 'Tipo de identificación' }
    ];

    return requiredFields.filter(field =>
      !formData[field.name] || formData[field.name].toString().trim() === ''
    ).map(field => field.label);
  };

  // Fetch user listings when component loads
  useEffect(() => {
    handleShowListings();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">Mi Perfil</h1>

      {/* Profile completion status banner */}
      <div className={`mb-6 p-4 rounded-lg ${isProfileCompleteForContract() ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
        <div className="flex items-center">
          {isProfileCompleteForContract() ? (
            <>
              <FaCheck className="text-green-500 mr-2 text-xl" />
              <div>
                <h3 className="font-semibold text-green-700">Perfil completo para contratos</h3>
                <p className="text-sm text-green-600">Tu perfil contiene toda la información necesaria para generar contratos.</p>
              </div>
            </>
          ) : (
            <>
              <FaInfoCircle className="text-yellow-500 mr-2 text-xl" />
              <div>
                <h3 className="font-semibold text-yellow-700">Perfil incompleto para contratos</h3>
                <p className="text-sm text-yellow-600">
                  Completa los siguientes campos para poder generar contratos:
                  <span className="font-medium block mt-1">
                    {getMissingContractFields().join(', ')}
                  </span>
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Tab navigation */}
      <div className="relative mb-6 border-b">
        <div className="overflow-x-auto pb-1 hide-scrollbar">
          <div className="flex whitespace-nowrap min-w-full">
            <button
              onClick={() => setActiveTab('personal')}
              className={`py-2 px-3 md:px-4 font-semibold text-sm md:text-base ${activeTab === 'personal' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
            >
              <span className="md:hidden">Personal</span>
              <span className="hidden md:inline">Información Personal</span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-2 px-3 md:px-4 font-semibold text-sm md:text-base ${activeTab === 'documents' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
            >
              <span className="md:hidden">Documentos</span>
              <span className="hidden md:inline">Documentos e ID</span>
            </button>
            <button
              onClick={() => setActiveTab('media')}
              className={`py-2 px-3 md:px-4 font-semibold text-sm md:text-base ${activeTab === 'media' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
            >
              <span className="md:hidden">Medios</span>
              <span className="hidden md:inline">Fotos y Videos</span>
            </button>
            <button
              onClick={() => setActiveTab('preferences')}
              className={`py-2 px-3 md:px-4 font-semibold text-sm md:text-base ${activeTab === 'preferences' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
            >
              <span className="md:hidden">Preferencias</span>
              <span className="hidden md:inline">Preferencias</span>
            </button>
            <button
              onClick={() => setActiveTab('listings')}
              className={`py-2 px-3 md:px-4 font-semibold text-sm md:text-base ${activeTab === 'listings' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500 hover:text-blue-500'}`}
            >
              <span className="md:hidden">Propiedades</span>
              <span className="hidden md:inline">Mis Propiedades</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar upload section - always visible */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <img
              src={formData.avatar || currentUser.avatar}
              alt="profile"
              className="rounded-full w-28 h-28 object-cover border-4 border-blue-100"
            />
            <button
              type="button"
              onClick={() => fileRef.current.click()}
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition"
            >
              <FaPen size={14} />
            </button>
          </div>
        </div>

        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accept="image/*"
        />
        <input
          type="file"
          ref={videoRef}
          hidden
          accept="video/*"
          onChange={(e) => setVideoFile(e.target.files[0])}
        />

        {/* File upload progress indicator */}
        {filePerc > 0 && filePerc < 100 && (
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${filePerc}%` }}
            ></div>
            <p className="text-sm text-gray-500 mt-1">Subiendo imagen: {filePerc}%</p>
          </div>
        )}
        {fileUploadError && (
          <p className="text-red-500 text-sm">Error al subir la imagen.</p>
        )}

        {/* Personal information tab */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Información Personal</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Basic information */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="fullLegalName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre legal completo
                </label>
                <input
                  type="text"
                  id="fullLegalName"
                  value={formData.fullLegalName}
                  onChange={handleChange}
                  placeholder="Si es diferente del nombre de usuario"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled  // Email typically shouldn't be editable
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhoneAlt className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de nacimiento
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBirthdayCake className="text-gray-400" />
                  </div>
                  <input
                    type="date"
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Género
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Seleccionar</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">
                  Nacionalidad
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaFlag className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="nationality"
                    value={formData.nationality}
                    onChange={handleChange}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                  Ocupación
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaBriefcase className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="occupation"
                    value={formData.occupation}
                    onChange={handleChange}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="rol" className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  id="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Estudiante">Estudiante</option>
                  <option value="Trabajador">Trabajador</option>
                  <option value="Viajero">Viajero</option>
                  <option value="Sin Rol">Sin Rol</option>
                 
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="shortBio" className="block text-sm font-medium text-gray-700 mb-1">
                Biografía corta
              </label>
              <textarea
                id="shortBio"
                value={formData.shortBio}
                onChange={handleChange}
                rows="4"
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Cuéntanos un poco sobre ti..."
              ></textarea>
            </div>

            {/* Emergency contact section */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 border-b pb-2">Contacto de emergencia</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    id="emergencyContact.name"
                    value={formData.emergencyContact.name}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="emergencyContact.relationship" className="block text-sm font-medium text-gray-700 mb-1">
                    Relación
                  </label>
                  <input
                    type="text"
                    id="emergencyContact.relationship"
                    value={formData.emergencyContact.relationship}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="emergencyContact.phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    id="emergencyContact.phone"
                    value={formData.emergencyContact.phone}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Documents and ID tab */}
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Documentos e Identificación</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="tipoIdentificacion" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de identificación <span className="text-red-500">*</span>
                </label>
                <select
                  id="tipoIdentificacion"
                  value={formData.tipoIdentificacion}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="DNI">DNI</option>
                  <option value="NIE">NIE</option>
                  <option value="Pasaporte">Pasaporte</option>
                </select>
              </div>

              <div>
                <label htmlFor="numeroIdentificacion" className="block text-sm font-medium text-gray-700 mb-1">
                  Número de identificación <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaIdCard className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="numeroIdentificacion"
                    value={formData.numeroIdentificacion}
                    onChange={handleChange}
                    className="pl-10 w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-700 mb-2">Información importante</h3>
              <p className="text-sm text-blue-600">
                Esta información es necesaria para la generación de contratos y reservas de propiedades.
                Tus datos personales están protegidos y solo se utilizarán para los fines específicos
                establecidos en nuestra política de privacidad.
              </p>
            </div>
          </div>
        )}

        {/* Media tab */}
        {activeTab === 'media' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Fotos y Videos</h2>

            <div className="flex flex-col items-center space-y-4">
              <div className="w-full max-w-md">
                <h3 className="text-lg font-semibold mb-3">Foto de perfil</h3>
                <div className="flex justify-center items-center">
                  <img
                    src={formData.avatar}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                  />
                </div>
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={() => fileRef.current.click()}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition flex items-center"
                  >
                    <FaUpload className="mr-2" /> Subir nueva foto
                  </button>
                </div>
              </div>

              {filePerc > 0 && filePerc < 100 && (
                <div className="w-full max-w-md bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${filePerc}%` }}
                  ></div>
                  <p className="text-sm text-gray-500 mt-1">Subiendo: {filePerc}%</p>
                </div>
              )}

              <div className="w-full max-w-md mt-6">
                <h3 className="text-lg font-semibold mb-3">Video de presentación</h3>
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => videoRef.current.click()}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition flex items-center"
                  >
                    <FaVideo className="mr-2" /> Subir video
                  </button>
                </div>

                {videoPerc > 0 && videoPerc < 100 && (
                  <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-purple-600 h-2.5 rounded-full"
                      style={{ width: `${videoPerc}%` }}
                    ></div>
                    <p className="text-sm text-gray-500 mt-1">Subiendo video: {videoPerc}%</p>
                  </div>
                )}

                {formData.videos && formData.videos.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Videos subidos:</h4>
                    <ul className="space-y-2">
                      {formData.videos.map((video, index) => (
                        <li key={index} className="border rounded-lg p-2">
                          <video
                            src={video}
                            controls
                            className="w-full h-auto rounded"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Preferences tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Preferencias</h2>

            {/* Living preferences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Preferencias de convivencia</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="preferences.pets"
                    checked={formData.preferences.pets}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="preferences.pets" className="ml-2 text-gray-700">
                    Acepto mascotas
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="preferences.smoker"
                    checked={formData.preferences.smoker}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="preferences.smoker" className="ml-2 text-gray-700">
                    Soy fumador/a
                  </label>
                </div>

                <div>
                  <label htmlFor="preferences.schedule" className="block text-sm font-medium text-gray-700 mb-1">
                    Horario preferido
                  </label>
                  <select
                    id="preferences.schedule"
                    value={formData.preferences.schedule}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    <option value="Diurno">Diurno</option>
                    <option value="Nocturno">Nocturno</option>
                    <option value="Mixto">Mixto</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contract preferences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Preferencias de contrato</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="contractPreferences.preferredDuration" className="block text-sm font-medium text-gray-700 mb-1">
                    Duración preferida (meses)
                  </label>
                  <input
                    type="number"
                    id="contractPreferences.preferredDuration"
                    min="1"
                    max="36"
                    value={formData.contractPreferences.preferredDuration}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="contractPreferences.moveInDateFlexibility"
                    checked={formData.contractPreferences.moveInDateFlexibility}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="contractPreferences.moveInDateFlexibility" className="ml-2 text-gray-700">
                    Tengo flexibilidad en la fecha de entrada
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Opciones adicionales</h3>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="lookingForRoommate"
                  checked={formData.lookingForRoommate}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="lookingForRoommate" className="ml-2 text-gray-700">
                  Estoy buscando compañeros de piso
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Listings tab */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Mis Propiedades</h2>

            {userListings && userListings.length > 0 ? (
              <div className="space-y-4">
                {userListings.map((listing) => (
                  <div
                    key={listing._id}
                    className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white shadow-sm hover:shadow-md transition"
                  >
                    <Link to={`/listing/${listing._id}`} className="flex items-center gap-4 flex-1">
                      <img
                        src={listing.imageUrls[0]}
                        alt={listing.name}
                        className="h-16 w-16 md:h-20 md:w-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-blue-600 hover:underline">{listing.name}</p>
                        <p className="text-gray-500 text-sm">{listing.address}</p>
                        <p className="text-gray-700 font-medium">{listing.regularPrice}€ {listing.type === 'rent' ? '/ mes' : ''}</p>
                      </div>
                    </Link>
                    <div className="flex gap-2 self-end sm:self-auto">
                      <Link to={`/update-listing/${listing._id}`}>
                        <button className="px-3 py-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200 transition">
                          Editar
                        </button>
                      </Link>
                      <button
                        onClick={() => handleListingDelete(listing._id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No tienes propiedades publicadas</p>
                <Link to="/create-listing">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
                    Crear nueva propiedad
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Submit button - always visible */}
        {activeTab !== 'listings' && (
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition flex items-center"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (
                <>
                  <FaSave className="mr-2" /> Guardar cambios
                </>
              )}
            </button>
          </div>
        )}

        {updateSuccess && (
          <p className="text-green-500 text-center mt-4">
            Perfil actualizado exitosamente!
          </p>
        )}
      </form>

      {/* Account actions */}
      <div className="flex justify-between mt-8 pt-4 border-t">
        <button
          onClick={handleDeleteUser}
          className="text-red-500 flex items-center hover:text-red-700 transition"
        >
          <FaTrash className="mr-1" /> Eliminar cuenta
        </button>
        <button
          onClick={handleSignOut}
          className="text-gray-500 flex items-center hover:text-gray-700 transition"
        >
          <FaSignOutAlt className="mr-1" /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}

export default ProfileContent;