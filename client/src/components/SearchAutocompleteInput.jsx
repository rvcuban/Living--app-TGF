// src/components/SearchAutocompleteInput.jsx
import React, { useRef, useState ,useEffect} from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { libraries } from '../lib/googleAutcompletePlaces';
import { FaSearch, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';



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
    language: 'es', // Fuerza el idioma español
    //region: 'ES',   // Establece la región en España
    id: "google-map-script" // DEBO usar el mismo id en todas las llamadas
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

  useEffect(() => {
    if (isLoaded) {
      // Add custom styles to the Google autocomplete dropdown
      const style = document.createElement('style');
      style.textContent = `
        .pac-container {
          border-radius: 12px;
          border: none;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
          margin-top: 8px;
          font-family: inherit;
          overflow: hidden;
        }
        .pac-item {
          padding: 10px 15px;
          cursor: pointer;
        }
        .pac-item:hover {
          background-color: #f3f4f6;
        }
        .pac-item-selected {
          background-color: #eff6ff;
        }
        .pac-icon {
          color: #3b82f6;
        }
        .pac-item-query {
          font-weight: 500;
          color: #111827;
        }
        .pac-matched {
          font-weight: 600;
          color: #3b82f6;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return <input type="text" disabled placeholder="Cargando Google..." />;
  }

  return (
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      options={{
        componentRestrictions: { country: ['es','mx'] },
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
