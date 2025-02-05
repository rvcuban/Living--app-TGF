// src/components/CreateListing.jsx
import { useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SearchAutocompleteInput from "../components/SearchAutocompleteInput";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
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
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  // Estados para el mapa de comprobación de dirección
  const [mapVisible, setMapVisible] = useState(false);
  const [mapCenter, setMapCenter] = useState(null);

  // Carga la API de Google Maps (con la librería "places")
  const { isLoaded: isMapLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY_AUTOCOMPLETE,
    libraries: ["places"],
    id: "google-map-script",
  });

  // Función para subir imágenes
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
        })
        .catch(() => {
          setImageUploadError("Image upload failed (2 mb max per image)");
          setUploading(false);
        });
    } else {
      setImageUploadError("You can only upload 6 images per listing");
      setUploading(false);
    }
  };

  // Función para almacenar una imagen en Firebase
  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
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

  // Elimina una imagen de la lista
  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  // Maneja los cambios en inputs, radios y checkboxes
  const handleChange = (e) => {
    const { id, value, type, checked } = e.target;
    if (id === "sale" || id === "rent") {
      setFormData((prev) => ({
        ...prev,
        type: value,
      }));
      return;
    }
    if (id === "parking" || id === "furnished" || id === "offer") {
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

  // Función para comprobar la dirección y mostrar el mapa en un modal
  const handleCheckAddress = () => {
    if (!formData.address) {
      alert("Por favor, ingrese una dirección primero.");
      return;
    }
    if (!window.google || !window.google.maps) {
      alert("Google Maps API no está disponible. Intente de nuevo más tarde.");
      return;
    }
    console.log("Geocoding address:", formData.address);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      {
        address: formData.address,
        componentRestrictions: { country: "es" },
      },
      (results, status) => {
        console.log("Geocoder status:", status, results);
        if (status === "OK" && results && results.length > 0) {
          const location = results[0].geometry.location;
          setMapCenter({
            lat: location.lat(),
            lng: location.lng(),
          });
          setMapVisible(true);
        } else {
          alert("No se pudo encontrar la dirección. Por favor, verifique. Status: " + status);
        }
      }
    );
  };

  // Envía el formulario para crear el listing
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError("You must upload at least one image");
      if (+formData.regularPrice < +formData.discountPrice)
        return setError("Discount price must be lower than regular price");
      setLoading(true);
      setError(false);
      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        return setError(data.message);
      }
      if (data._id) {
        navigate(`/listing/${data._id}`);
      } else {
        console.error("Error: Listing ID not returned from server.");
        setError("Error creating listing. Please try again.");
      }
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-semibold text-center my-7">Create a Listing</h1>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        {/* Sección de Detalles */}
        <div className="bg-white shadow-md rounded-lg p-4 flex-1 flex flex-col gap-4">
          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Localidad
            </label>
            <input
              id="name"
              type="text"
              placeholder="Name"
              className="border p-3 rounded-lg w-full"
              maxLength="62"
              minLength="10"
              required
              onChange={handleChange}
              value={formData.name}
            />
          </div>
          {/* Descripción */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              id="description"
              placeholder="Description"
              className="border p-3 rounded-lg w-full"
              required
              onChange={handleChange}
              value={formData.description}
            />
          </div>
          {/* Dirección con Autocompletado y Botón de Comprobación */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Dirección
            </label>
           

            <SearchAutocompleteInput 
              value={formData.address}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, address: value }))
              }
              onSelectPlace={(value) =>
                setFormData((prev) => ({ ...prev, address: value }))
              }
              placeholder="Buscar dirección en España..."
              className ="relative focus:outline-none bg-white  border p-3 rounded-lg  w-full max-w-xl flex items-center mx-auto"
            />
           
            <button
              type="button"
              onClick={handleCheckAddress}
              className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 transition mt-2"
            >
              Comprobar dirección
            </button>
          </div>
          {/* Tipo y Opciones */}
          <div className="flex gap-6 flex-wrap">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="sale"
                name="type"
                value="sale"
                onChange={handleChange}
                checked={formData.type === "sale"}
                className="w-5 h-5"
              />
              <label htmlFor="sale">Sell</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="rent"
                name="type"
                value="rent"
                onChange={handleChange}
                checked={formData.type === "rent"}
                className="w-5 h-5"
              />
              <label htmlFor="rent">Rent</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="parking"
                onChange={handleChange}
                checked={formData.parking}
                className="w-5 h-5"
              />
              <label htmlFor="parking">Parking spot</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="furnished"
                onChange={handleChange}
                checked={formData.furnished}
                className="w-5 h-5"
              />
              <label htmlFor="furnished">Furnished</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="offer"
                onChange={handleChange}
                checked={formData.offer}
                className="w-5 h-5"
              />
              <label htmlFor="offer">Offer</label>
            </div>
          </div>
          {/* Características y Precios */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="border p-3 rounded-lg w-20"
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p className="text-sm">Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="border p-3 rounded-lg w-20"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p className="text-sm">Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="50"
                max="10000000"
                required
                className="border p-3 rounded-lg w-28"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p className="text-sm">Regular Price</p>
                {formData.type === "rent" && (
                  <span className="text-xs text-gray-600">($ / month)</span>
                )}
              </div>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="10000000"
                  required
                  className="border p-3 rounded-lg w-28"
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <div className="flex flex-col items-center">
                  <p className="text-sm">Discount Price</p>
                  {formData.type === "rent" && (
                    <span className="text-xs text-gray-600">($ / month)</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sección de Imágenes */}
        <div className="bg-white shadow-md rounded-lg p-4 flex-1 flex flex-col gap-4">
          <div>
            <p className="font-semibold text-lg">
              Images:{" "}
              <span className="font-normal text-gray-600 ml-2 text-sm">
                The first image will be the cover (max 6)
              </span>
            </p>
          </div>
          <div className="flex gap-4 flex-col sm:flex-row">
            <input
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="border p-3 rounded-lg w-full"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={handleImageSubmit}
              className="bg-green-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-600 transition disabled:opacity-80"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          {imageUploadError && (
            <p className="text-red-700 text-sm">{imageUploadError}</p>
          )}
          <div className="flex flex-col gap-4">
            {formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
              >
                <img
                  src={url}
                  alt="listing"
                  className="w-20 h-20 object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="bg-red-500 text-white px-3 py-1 rounded uppercase hover:opacity-75 transition"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
          <button
            type="submit"
            disabled={loading || uploading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-600 transition uppercase disabled:opacity-80"
          >
            {loading ? "Creating..." : "Create Listing"}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>

      {/* Modal para mostrar el mapa en grande */}
      {mapVisible && isMapLoaded && mapCenter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Fondo semitransparente que cierra el modal al hacer clic */}
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setMapVisible(false)}
          ></div>
          {/* Contenedor del modal */}
          <div className="relative bg-white rounded-lg shadow-lg overflow-hidden w-11/12 md:w-3/4 lg:w-1/2 z-10">
            <div className="flex justify-end p-2">
              <button
                onClick={() => setMapVisible(false)}
                className="text-gray-700 text-2xl leading-none hover:text-gray-900"
              >
                &times;
              </button>
            </div>
            <div className="p-4" style={{ height: "400px" }}>
              <GoogleMap
                center={mapCenter}
                zoom={15}
                mapContainerStyle={{ width: "100%", height: "100%" }}
              >
                <Marker position={mapCenter} />
              </GoogleMap>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
