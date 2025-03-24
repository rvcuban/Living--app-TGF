import { useState, useEffect } from "react";
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SearchAutocompleteInput from "../components/SearchAutocompleteInput";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { FaUpload, FaTrash, FaHome, FaBed, FaBath, FaParking, FaCouch, FaPercentage, FaMapMarkerAlt, FaEuroSign } from "react-icons/fa";
import { toast } from "react-toastify";

import MapVerification from '../components/MapVerification';
export const normalizeText = (text) => {
  if (!text) return '';
  
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
};
export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
    // New fields for improved data
    capacity: 1,
    maxPeople: 1,
    pets: false,
    roomSize: "",
    availableFrom: new Date().toISOString().split('T')[0],
    amenities: [],
    visible: true,
  });

  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mapVisible, setMapVisible] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);
  const [isAddressValid, setIsAddressValid] = useState(false);







  const amenityOptions = [
    { id: 'wifi', label: 'WiFi' },
    { id: 'tv', label: 'TV' },
    { id: 'kitchen', label: 'Cocina Compartida' },
    { id: 'washer', label: 'Lavadora' },
    { id: 'ac', label: 'Aire Acondicionado' },
    { id: 'heat', label: 'Calefacción' },
    { id: 'workspace', label: 'Zona de Trabajo' },
    { id: 'gym', label: 'Gimnasio' }
  ];

  // Function to check if current step is complete
  const isStepComplete = (step) => {
    switch (step) {
      case 1:
        return formData.name.length >= 10 && formData.description.length > 0;
      case 2:
        return isAddressValid && formData.address.length > 0;
      case 3:
        return formData.imageUrls.length > 0;
      case 4:
        return true; // Basic info is always complete with defaults
      default:
        return false;
    }
  };

  // Handle image uploads
  const handleImageSubmit = () => {
    if (files.length > 0 && files.length + formData.imageUrls.length <= 6) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData((prev) => ({
            ...prev,
            imageUrls: prev.imageUrls.concat(urls),
          }));
          setImageUploadError(false);
          setUploading(false);
          toast.success("Imágenes subidas correctamente");
        })
        .catch(() => {
          setImageUploadError("Error al subir las imágenes (máximo 2MB por imagen)");
          setUploading(false);
          toast.error("Error al subir las imágenes");
        });
    } else {
      setImageUploadError("Puedes subir hasta 6 imágenes por propiedad");
      setUploading(false);
    }
  };

  // Store image in Firebase
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  // Remove image from list
  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
    toast.info("Imagen eliminada");
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;

    if (id === "sale" || id === "rent") {
      setFormData((prev) => ({
        ...prev,
        type: value,
      }));
      return;
    }

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [id]: checked,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle amenities selection
  const handleAmenityChange = (amenityId) => {
    setFormData(prev => {
      const updatedAmenities = prev.amenities.includes(amenityId)
        ? prev.amenities.filter(a => a !== amenityId)
        : [...prev.amenities, amenityId];

      return {
        ...prev,
        amenities: updatedAmenities
      };
    });
  };

  // Validate address using Google Maps API
  const handleCheckAddress = () => {
    if (!formData.address) {
      toast.warning("Por favor, ingresa una dirección primero");
      return;
    }

    // Simply show the map verification modal
    setMapVisible(true);
  };

  // Handle confirming the address from the map modal
  const handleConfirmAddress = () => {
    setIsAddressValid(true);
    setMapVisible(false);
    toast.success("Dirección validada correctamente");
  };

  // Submit form to create listing
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (formData.imageUrls.length < 1) {
        toast.error("Debes subir al menos una imagen");
        setActiveStep(3);
        return;
      }

      if (!isAddressValid) {
        toast.error("Debes validar la dirección");
        setActiveStep(2);
        return;
      }

      if (+formData.regularPrice < +formData.discountPrice) {
        toast.error("El precio con descuento debe ser menor que el precio regular");
        return;
      }

      setLoading(true);
      setError(false);

      const normalizedAddress = normalizeText(formData.address);

      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          normalized_address: normalizedAddress,
          userRef: currentUser._id,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success === false) {
        toast.error(data.message || "Error al crear la propiedad");
        return;
      }

      if (data._id) {
        toast.success("¡Propiedad creada con éxito!");
        navigate(`/listing/${data._id}`);
      } else {
        console.error("Error: Listing ID not returned from server.");
        setError("Error al crear la propiedad. Inténtalo de nuevo.");
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
      toast.error("Error al crear la propiedad");
    }
  };

  // Next step in form
  const goToNextStep = () => {
    if (isStepComplete(activeStep) && activeStep < 5) {
      setActiveStep(activeStep + 1);
    } else if (!isStepComplete(activeStep)) {
      // Show what's missing
      switch (activeStep) {
        case 1:
          toast.warning("Completa el nombre (mínimo 10 caracteres) y la descripción");
          break;
        case 2:
          toast.warning("Valida la dirección");
          break;
        case 3:
          toast.warning("Sube al menos una imagen");
          break;
      }
    }
  };

  // Previous step in form
  const goToPrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-4 min-h-[calc(100vh-200px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-center my-7 text-gray-800">
          Publica tu Propiedad
        </h1>

        {/* Progress Stepper */}
        <div className="flex justify-between items-center w-full max-w-3xl mx-auto mb-8">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className="flex flex-col items-center"
              onClick={() => isStepComplete(step - 1) && setActiveStep(step)}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeStep === step
                  ? "bg-pink-500 text-white"
                  : activeStep > step
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
                  } ${isStepComplete(step - 1) && activeStep !== step ? "cursor-pointer hover:bg-pink-400" : ""}`}
              >
                {step}
              </div>
              <span className="text-xs text-gray-500 mt-1 text-center">
                {step === 1 ? "Básico" :
                  step === 2 ? "Ubicación" :
                    step === 3 ? "Fotos" :
                      step === 4 ? "Detalles" :
                        "Finalizar"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Step 1: Basic Info */}
        {activeStep === 1 && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
              <FaHome className="mr-2 text-pink-500" /> Información Básica
            </h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de la Propiedad*
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ej: Acogedor apartamento en el centro de Madrid"
                  className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  maxLength="62"
                  minLength="10"
                  required
                  onChange={handleChange}
                  value={formData.name}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo 10 caracteres. Actual: {formData.name.length}
                </p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción*
                </label>
                <textarea
                  id="description"
                  placeholder="Describe tu propiedad, características destacadas, entorno..."
                  className="border p-3 rounded-lg w-full h-32 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                  onChange={handleChange}
                  value={formData.description}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Oferta*
                </label>
                <div className="flex flex-wrap gap-4">
                  <div className={`border rounded-lg p-4 flex items-center gap-3 cursor-pointer transition ${formData.type === "rent" ? "border-pink-500 bg-pink-50" : "border-gray-200"
                    }`}
                    onClick={() => handleChange({ target: { id: "rent", value: "rent" } })}
                  >
                    <input
                      type="radio"
                      id="rent"
                      name="type"
                      value="rent"
                      onChange={handleChange}
                      checked={formData.type === "rent"}
                      className="w-5 h-5 accent-pink-500"
                    />
                    <label htmlFor="rent" className="cursor-pointer">Alquiler</label>
                  </div>

                  <div className={`border rounded-lg p-4 flex items-center gap-3 cursor-pointer transition ${formData.type === "sale" ? "border-pink-500 bg-pink-50" : "border-gray-200"
                    }`}
                    onClick={() => handleChange({ target: { id: "sale", value: "sale" } })}
                  >
                    <input
                      type="radio"
                      id="sale"
                      name="type"
                      value="sale"
                      onChange={handleChange}
                      checked={formData.type === "sale"}
                      className="w-5 h-5 accent-pink-500"
                    />
                    <label htmlFor="sale" className="cursor-pointer">Venta</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Location */}
        {activeStep === 2 && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-pink-500" /> Ubicación
            </h2>

            <div className="space-y-6">
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección*
                </label>
                <div className="relative">
                  <SearchAutocompleteInput
                    value={formData.address}
                    onChange={(value) => setFormData((prev) => ({ ...prev, address: value }))}
                    onSelectPlace={(value) => {
                      setFormData((prev) => ({ ...prev, address: value }));
                      setIsAddressValid(false); // Reset validation when address changes
                    }}
                    onValidationChange={(isValid) => {
                      // This might be called from SearchAutocompleteInput if implemented
                    }}
                    placeholder="Buscar dirección en España..."
                    inputClassName="border p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleCheckAddress}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition flex items-center"
                  >
                    <FaMapMarkerAlt className="mr-2" /> Verificar Dirección
                  </button>

                  {isAddressValid && (
                    <p className="text-green-500 text-sm mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Dirección verificada correctamente
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Photos */}
        {activeStep === 3 && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
              <FaUpload className="mr-2 text-pink-500" /> Fotos
            </h2>

            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Fotos de la Propiedad*
                  <span className="text-xs text-gray-500 ml-2">
                    La primera foto será la principal (máx. 6 fotos)
                  </span>
                </p>

                <div className="flex gap-4 flex-col sm:flex-row items-center">
                  <label className="border-2 border-dashed border-gray-300 rounded-lg p-4 w-full cursor-pointer hover:bg-gray-50 transition">
                    <div className="flex flex-col items-center">
                      <FaUpload className="text-gray-400 text-2xl mb-2" />
                      <p className="text-sm text-gray-500">Haz clic para seleccionar o arrastra tus fotos aquí</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (máx. 2MB)</p>
                    </div>
                    <input
                      type="file"
                      id="images"
                      accept="image/*"
                      multiple
                      onChange={(e) => setFiles(e.target.files)}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    disabled={uploading || !files.length}
                    onClick={handleImageSubmit}
                    className="bg-pink-500 text-white px-6 py-3 rounded-md shadow-md hover:bg-pink-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {uploading ? "Subiendo..." : "Subir Fotos"}
                  </button>
                </div>

                {imageUploadError && (
                  <p className="text-red-700 text-sm mt-2">{imageUploadError}</p>
                )}
              </div>

              {formData.imageUrls.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Fotos Subidas: {formData.imageUrls.length}/6
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.imageUrls.map((url, index) => (
                      <div
                        key={url}
                        className="relative group border border-gray-200 rounded-lg overflow-hidden"
                      >
                        <img
                          src={url}
                          alt={`Propiedad ${index + 1}`}
                          className="w-full h-48 object-cover"
                        />

                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                            Principal
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-white bg-opacity-80 p-2 rounded-full text-red-500 hover:bg-opacity-100 hover:text-red-600 transition"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Property Details */}
        {activeStep === 4 && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
              <FaBed className="mr-2 text-pink-500" /> Detalles de la Propiedad
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="bedrooms" className="block text-sm font-medium text-gray-700 mb-1">
                  Habitaciones*
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="bedrooms"
                    min="1"
                    max="20"
                    required
                    className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    onChange={handleChange}
                    value={formData.bedrooms}
                  />
                  <FaBed className="text-gray-400 -ml-8" />
                </div>
              </div>

              <div>
                <label htmlFor="bathrooms" className="block text-sm font-medium text-gray-700 mb-1">
                  Baños*
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="bathrooms"
                    min="1"
                    max="10"
                    required
                    className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    onChange={handleChange}
                    value={formData.bathrooms}
                  />
                  <FaBath className="text-gray-400 -ml-8" />
                </div>
              </div>

              <div>
                <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                  Capacidad de inquilinos*
                </label>
                <input
                  type="number"
                  id="capacity"
                  min="1"
                  max="20"
                  required
                  className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  onChange={handleChange}
                  value={formData.capacity}
                />
              </div>

              <div>
                <label htmlFor="maxPeople" className="block text-sm font-medium text-gray-700 mb-1">
                  Ocupación máxima
                </label>
                <input
                  type="number"
                  id="maxPeople"
                  min="1"
                  max="30"
                  className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  onChange={handleChange}
                  value={formData.maxPeople}
                />
              </div>

              <div>
                <label htmlFor="roomSize" className="block text-sm font-medium text-gray-700 mb-1">
                  Tamaño de habitación (m²)
                </label>
                <input
                  type="text"
                  id="roomSize"
                  placeholder="Ej: 15"
                  className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  onChange={handleChange}
                  value={formData.roomSize}
                />
              </div>

              <div>
                <label htmlFor="availableFrom" className="block text-sm font-medium text-gray-700 mb-1">
                  Disponible desde
                </label>
                <input
                  type="date"
                  id="availableFrom"
                  className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  onChange={handleChange}
                  value={formData.availableFrom}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Características
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className={`border rounded-lg p-3 flex items-center gap-2 cursor-pointer transition ${formData.parking ? "border-pink-500 bg-pink-50" : "border-gray-200"
                    }`}
                    onClick={() => handleChange({ target: { id: "parking", type: "checkbox", checked: !formData.parking } })}
                  >
                    <input
                      type="checkbox"
                      id="parking"
                      onChange={handleChange}
                      checked={formData.parking}
                      className="w-4 h-4 accent-pink-500"
                    />
                    <label htmlFor="parking" className="cursor-pointer text-sm">Parking</label>
                  </div>

                  <div className={`border rounded-lg p-3 flex items-center gap-2 cursor-pointer transition ${formData.furnished ? "border-pink-500 bg-pink-50" : "border-gray-200"
                    }`}
                    onClick={() => handleChange({ target: { id: "furnished", type: "checkbox", checked: !formData.furnished } })}
                  >
                    <input
                      type="checkbox"
                      id="furnished"
                      onChange={handleChange}
                      checked={formData.furnished}
                      className="w-4 h-4 accent-pink-500"
                    />
                    <label htmlFor="furnished" className="cursor-pointer text-sm">Amueblado</label>
                  </div>

                  <div className={`border rounded-lg p-3 flex items-center gap-2 cursor-pointer transition ${formData.pets ? "border-pink-500 bg-pink-50" : "border-gray-200"
                    }`}
                    onClick={() => handleChange({ target: { id: "pets", type: "checkbox", checked: !formData.pets } })}
                  >
                    <input
                      type="checkbox"
                      id="pets"
                      onChange={handleChange}
                      checked={formData.pets}
                      className="w-4 h-4 accent-pink-500"
                    />
                    <label htmlFor="pets" className="cursor-pointer text-sm">Mascotas permitidas</label>
                  </div>

                  <div className={`border rounded-lg p-3 flex items-center gap-2 cursor-pointer transition ${formData.offer ? "border-pink-500 bg-pink-50" : "border-gray-200"
                    }`}
                    onClick={() => handleChange({ target: { id: "offer", type: "checkbox", checked: !formData.offer } })}
                  >
                    <input
                      type="checkbox"
                      id="offer"
                      onChange={handleChange}
                      checked={formData.offer}
                      className="w-4 h-4 accent-pink-500"
                    />
                    <label htmlFor="offer" className="cursor-pointer text-sm">Oferta especial</label>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comodidades disponibles
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {amenityOptions.map(amenity => (
                    <div
                      key={amenity.id}
                      className={`border rounded-lg p-3 flex items-center gap-2 cursor-pointer transition ${formData.amenities.includes(amenity.id) ? "border-pink-500 bg-pink-50" : "border-gray-200"
                        }`}
                      onClick={() => handleAmenityChange(amenity.id)}
                    >
                      <input
                        type="checkbox"
                        id={`amenity-${amenity.id}`}
                        checked={formData.amenities.includes(amenity.id)}
                        onChange={() => handleAmenityChange(amenity.id)}
                        className="w-4 h-4 accent-pink-500"
                      />
                      <label htmlFor={`amenity-${amenity.id}`} className="cursor-pointer text-sm">
                        {amenity.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label htmlFor="regularPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Precio Regular*
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="regularPrice"
                    min="50"
                    max="10000000"
                    required
                    className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    onChange={handleChange}
                    value={formData.regularPrice}
                  />
                  <div className="flex items-center ml-3">
                    <FaEuroSign className="text-gray-600" />
                    {formData.type === "rent" && (
                      <span className="text-sm text-gray-600 ml-1">/ mes</span>
                    )}
                  </div>
                </div>
              </div>

              {formData.offer && (
                <div>
                  <label htmlFor="discountPrice" className="block text-sm font-medium text-gray-700 mb-1">
                    Precio con Descuento
                  </label>
                  <div className="flex items-center">
                    <input
                      type="number"
                      id="discountPrice"
                      min="0"
                      max={formData.regularPrice}
                      required={formData.offer}
                      className="border p-3 rounded-lg w-full focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      onChange={handleChange}
                      value={formData.discountPrice}
                    />
                    <div className="flex items-center ml-3">
                      <FaEuroSign className="text-gray-600" />
                      {formData.type === "rent" && (
                        <span className="text-sm text-gray-600 ml-1">/ mes</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Summary and Submit */}
        {activeStep === 5 && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Resumen y Publicación</h2>

            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3">Detalles de la Propiedad</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium">{formData.name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="font-medium capitalize">{formData.type === 'rent' ? 'Alquiler' : 'Venta'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="font-medium">{formData.address}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Precio</p>
                    <p className="font-medium">
                      {formData.offer ? (
                        <>
                          <span className="line-through text-gray-400 mr-2">
                            {formData.regularPrice}€
                          </span>
                          {formData.discountPrice}€
                        </>
                      ) : (
                        `${formData.regularPrice}€`
                      )}
                      {formData.type === 'rent' && ' / mes'}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Habitaciones</p>
                    <p className="font-medium">{formData.bedrooms}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Baños</p>
                    <p className="font-medium">{formData.bathrooms}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Características</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {formData.parking && (
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Parking</span>
                      )}
                      {formData.furnished && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Amueblado</span>
                      )}
                      {formData.pets && (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded">Mascotas</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Capacidad</p>
                    <p className="font-medium">{formData.capacity} inquilinos</p>
                  </div>
                </div>
              </div>

              {formData.imageUrls.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-3">Vista Previa</h3>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                    {formData.imageUrls.map((url, index) => (
                      <div key={url} className={`relative ${index === 0 ? "col-span-3 row-span-2" : ""}`}>
                        <img
                          src={url}
                          alt={`Propiedad ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                        {index === 0 && (
                          <div className="absolute top-2 left-2 bg-pink-500 text-white text-xs px-2 py-1 rounded">
                            Principal
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">¿Listo para publicar?</h3>
                <p className="text-blue-700 text-sm">
                  Revisa los detalles antes de publicar tu propiedad. Una vez publicada, podrás editarla o eliminarla desde tu perfil.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center p-6 border-t">
          {activeStep > 1 ? (
            <button
              type="button"
              onClick={goToPrevStep}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition"
            >
              Anterior
            </button>
          ) : (
            <div></div>
          )}

          {activeStep < 5 ? (
            <button
              type="button"
              onClick={goToNextStep}
              className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition"
            >
              Siguiente
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-8 py-3 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition disabled:opacity-70 flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publicando...
                </>
              ) : (
                "Publicar Propiedad"
              )}
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 text-center">
            {error}
          </div>
        )}
      </form>

      {/* Map Modal */}
      <MapVerification 
        address={formData.address}
        isVisible={mapVisible}
        onClose={() => setMapVisible(false)}
        onConfirm={handleConfirmAddress}
      />
    </main>
  );
}