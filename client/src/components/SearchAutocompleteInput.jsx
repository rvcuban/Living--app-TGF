// src/components/SearchAutocompleteInput.jsx
import React, { useRef, useState } from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { libraries } from '../lib/googleAutcompletePlaces';

export default function SearchAutocompleteInput({
  value,
  onChange,
  onSelectPlace,
  placeholder = 'Buscar dirección en España...',
  inputClassName // Nuevo prop para definir el estilo del input desde afuera
}) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY_AUTOCOMPLETE,
    libraries,
    id: "google-map-script" // Asegúrate de usar el mismo id en todas las llamadas
  });

  const [localValue, setLocalValue] = useState(value || '');
  const autocompleteRef = useRef(null);

  const onLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place) {
        const formattedAddress = place.formatted_address || place.name;
        setLocalValue(formattedAddress);
        if (onSelectPlace) {
          onSelectPlace(formattedAddress);
        }
      }
    }
  };

  const handleInputChange = (e) => {
    setLocalValue(e.target.value);
    if (onChange) {
      onChange(e.target.value);
    }
  };

  if (!isLoaded) {
    return <input type="text" disabled placeholder="Cargando Google..." />;
  }

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      options={{
        componentRestrictions: { country: 'es' },
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
      }}
    >
      <input
        type="text"
        // Usa el prop recibido; si no se pasa, se puede definir un valor por defecto (opcional)
        className={inputClassName }
        placeholder={placeholder}
        value={localValue}
        onChange={handleInputChange}
      />
    </Autocomplete>
  );
}
