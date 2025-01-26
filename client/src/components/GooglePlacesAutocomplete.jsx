import React, { useState, useRef } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  useLoadScript,
  StandaloneSearchBox,
} from "@react-google-maps/api";



export default function GooglePlacesAutocomplete() {

  const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY_AUTOCOMPLETE;
  const inputref = useRef(null)

  // Estado local para mostrar el valor del input
  const [address, setAddress] = useState("");
  // Aquí guardamos la referencia al SearchBox
  const searchBoxRef = useRef(null);

  // Hook que carga la librería de Google con la API key
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey:GOOGLE_MAPS_API_KEY ,
    libraries: ["places"]
  })

  // Maneja el evento cuando cambia la lista de lugares
  const handlePlacesChanged = () => {
    if (searchBoxRef.current) {
      const places = searchBoxRef.current.getPlaces();
      if (places && places.length > 0) {
        // Tomamos el primero
        const place = places[0];
        // place.formatted_address o place.name
        const newAddress = place.formatted_address || place.name;
        setAddress(newAddress);
      }
    }
  };

  if (!isLoaded) {
    return <div>Cargando librería de Google...</div>;
  }




  return (
    <div className="w-full max-w-md">

      {isLoaded &&
        <StandaloneSearchBox
        onLoad={(ref)=>inputref.current=ref}
        onPlacesChanged={handlePlacesChanged}>
          {/* El input que Google usará para autocompletar */}
          <input
            type="text"
            className="border w-full p-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            placeholder="Escribe una dirección o lugar..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </StandaloneSearchBox>
        
      
    }
    </div>
  );
}
