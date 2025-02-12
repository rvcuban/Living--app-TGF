// src/components/GooglePlacesAutocomplete.jsx
import React, { useState, useRef, useEffect } from "react";
import { StandaloneSearchBox, useJsApiLoader } from "@react-google-maps/api";

export default function GooglePlacesAutocomplete({ value, onChange }) {
  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY_AUTOCOMPLETE;
  const [address, setAddress] = useState(value || "");
  const searchBoxRef = useRef(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });

  // Actualiza el valor local si cambia el prop "value"
  useEffect(() => {
    setAddress(value);
  }, [value]);

  const handlePlacesChanged = () => {
    if (searchBoxRef.current) {
      const places = searchBoxRef.current.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        const newAddress = place.formatted_address || place.name;
        setAddress(newAddress);
        if (onChange) {
          onChange(newAddress);
        }
      }
    }
  };

  if (!isLoaded) {
    return <div>Cargando librería de Google...</div>;
  }

  return (
    <div className="w-full">
      <StandaloneSearchBox
        onLoad={(ref) => {
          searchBoxRef.current = ref;
        }}
        onPlacesChanged={handlePlacesChanged}
      >
        <input
          type="text"
          className="border w-full p-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Escribe una dirección o lugar..."
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
            if (onChange) {
              onChange(e.target.value);
            }
          }}
        />
      </StandaloneSearchBox>
    </div>
  );
}
