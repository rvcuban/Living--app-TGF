// src/components/CompleteProfileModal.jsx
import React, { useState, useEffect } from "react";
import GooglePlacesAutocomplete from "./GooglePlacesAutocomplete";
import { useDispatch } from "react-redux";
import { updateUserSuccess } from "../redux/user/userSlice"; 
import SearchAutocompleteInput from "./SearchAutocompleteInput";

export default function CompleteProfileModal({
  visible = false,
  currentUser,
  onClose = () => { },
  onComplete = () => { },
}) {
  const [formData, setFormData] = useState({
    location: "",
    lookingForRoommate: false,
    rol: ''
  });

  const dispatch = useDispatch();
  const [location, setLocation] = useState("");

  const handleSelectLocation = (selected) => {
    console.log("Ubicación seleccionada:", selected);
    // setLocation(selected) -> ya se maneja con onChange 
    // o actualiza un formData con la loc
  };

  useEffect(() => {
    if (currentUser) {
      // Pre-cargar datos si el user ya tiene algo
      setFormData({
        location: currentUser.location || "",
        lookingForRoommate: currentUser.lookingForRoommate || false,
        rol: currentUser.rol || "Sin Rol"
      });
    }
  }, [currentUser]);

  if (!visible) return null;

  // Manejador de cambios en formularios
  const handleChange = (e) => {
    const { id, type, value, checked } = e.target;
    if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [id]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [id]: value }));
    }
  };

  // Guardar la información mínima
  const handleSave = async () => {
    try {

      console.log("Enviando update al backend:", {
        // log lo que mandas
        location: formData.location,
        lookingForRoommate: formData.lookingForRoommate,
        rol: formData.rol,
        isNewUser: false
      });

      const res = await fetch(`/api/user/update_setnewuser/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          location: formData.location,
          lookingForRoommate: formData.lookingForRoommate,
          rol: formData.rol,
          // También podrías marcar isNew: false aquí, si usas esa lógica
          isNewUser: false
        })
      });
 

      if (!res.ok) {
        console.error("Error HTTP:", res.status, res.statusText);
        return;
      }



      const data = await res.json();
      console.log("Update Response data =>", data);
      if (data.success === false) {
        // Manejo de error
        console.error("Error al actualizar datos:", data.message);
        return;
      }
      // data => { success, data: userActualizado }
      // Lógica para actualizar tu Redux/estado si hace falta

      dispatch(updateUserSuccess(data.data));

      if (onComplete) onComplete();
      if (onClose) onClose();
    } catch (err) {
      console.error("Error en handleSave:", err);
    }
  };
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white shadow-xl rounded-xl flex flex-col w-full max-w-md max-h-[80vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Evita cerrar el modal al hacer clic dentro
      >
        {/* Encabezado */}
        <div className="border-b px-6 py-4 bg-white text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-700">
            ¡No Quiero gente Falsa!
          </h2>
          <p className="text-sm sm:text-base text-gray-600 mt-2 max-w-xs mx-auto">
            Completa este formulario. Solo queremos comprobar que no eres un robot.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            (Toma menos de 7 segundos)
          </p>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 px-6 py-4 overflow-y-auto">
          {/* Roles */}
          <div className="flex items-center justify-between gap-2 mt-2">
            {/* Opción: Soy inquilino/a */}
            <div
              onClick={() =>
                setFormData((prev) => ({ ...prev, rol: "inquilino" }))
              }
              className={`cursor-pointer px-2 py-3 text-center border rounded-md w-1/2 transition-colors 
              ${formData.rol === "inquilino"
                  ? "bg-blue-50 border-blue-500"
                  : "hover:bg-gray-50"
                }`}
            >
              Soy inquilino/a
            </div>

            {/* Opción: Soy anunciante */}
            <div
              onClick={() =>
                setFormData((prev) => ({ ...prev, rol: "propietario" }))
              }
              className={`cursor-pointer px-2 py-3 text-center border rounded-md w-1/2 transition-colors 
              ${formData.rol === "propietario"
                  ? "bg-blue-50 border-blue-500"
                  : "hover:bg-gray-50"
                }`}
            >
              Soy anunciante
            </div>
          </div>

          {/* Ubicación principal */}
          <div className="mt-6">
            <label
              htmlFor="location"
              className="block text-sm font-semibold text-gray-700"
            >
              Ubicación principal
            </label>
            <span className="block text-xs text-gray-400 mb-1">
              (Dónde buscas o alquilas)
            </span>
            <SearchAutocompleteInput />
          </div>

          {/* Buscando compañero */}
          <div className="mt-6 flex items-center gap-2">
            <input
              id="lookingForRoommate"
              type="checkbox"
              checked={formData.lookingForRoommate}
              onChange={handleChange}
            />
            <label
              htmlFor="lookingForRoommate"
              className="text-sm text-gray-700"
            >
              Estoy buscando compañero/a de piso
            </label>
          </div>
          <span className="text-xs text-gray-400 mt-1 block">
            Al marcar esta opción aparecerás en la sección de “Buscar Compi”.
          </span>
        </div>

        {/* Botón Aceptar */}
        <div className="border-t px-6 py-4 bg-gray-50">
          <button
            onClick={handleSave}
            className="w-full bg-blue-500 text-white py-3 rounded-md hover:bg-blue-600 transition-colors"
          >
            Aceptar y continuar
          </button>
        </div>
      </div>
    </div>
  );
}