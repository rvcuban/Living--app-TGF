// src/components/SearchAutocompleteInput.jsx
import React, { useRef, useState ,useEffect} from 'react';
import { Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { libraries } from '../lib/googleAutcompletePlaces';
import { FaSearch, FaTimes, FaMapMarkerAlt } from 'react-icons/fa';



export default function SearchAutocompleteInput({
  value,
  onChange,
  onSelectPlace,
  onValidationChange,
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
  const [inputValue, setInputValue] = useState(value);
  const [isValidSelection, setIsValidSelection] = useState(false);
  const inputRef = useRef(null);

  const [userCount, setUserCount] = useState(null);
  const [fetchingCount, setFetchingCount] = useState(false);

 // Update local value when prop changes
 useEffect(() => {
  if (value !== localValue) {
    setLocalValue(value || '');
    // Reset validation status when value is set from outside
    setIsValidSelection(false);
  }
}, [value]);

// Notify parent component when validation status changes
useEffect(() => {
  if (onValidationChange) {
    onValidationChange(isValidSelection);
  }
}, [isValidSelection, onValidationChange]);

  
  const onLoad = (autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const onPlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place) {
        const formattedAddress = place.formatted_address || place.name;
        setLocalValue(formattedAddress);
        setIsValidSelection(true);
        if (onSelectPlace) {
          onSelectPlace(formattedAddress);
        }
       
      }
    }
  };


  const fetchUserCountForLocation = async (location) => {
    try {
      setFetchingCount(true);
      
      // Extract city name from the formatted address
      // This is a simple extraction - you might need more complex parsing
      const cityMatch = location.match(/^([^,]+)/);
      const cityName = cityMatch ? cityMatch[1].trim() : location;
      
      const response = await api.get(`/api/user/count-by-location?location=${encodeURIComponent(cityName)}`);
      
      if (response.data.success) {
        setUserCount(response.data.data.userCount);
      } else {
        setUserCount(0);
      }
    } catch (error) {
      console.error('Error fetching user count:', error);
      setUserCount(0);
    } finally {
      setFetchingCount(false);
    }
  };

  const handleInputChange = (e) => {
    setLocalValue(e.target.value);
    setIsValidSelection(false);
    if (onChange) {
      onChange(e.target.value);
    }
  };

  const handleClear = () => {
    setLocalValue('');
    setIsValidSelection(false);
    if (onChange) {
      onChange('');
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
  const finalInputClassName = `${inputClassName} ${
    localValue && !isValidSelection ? 'border-yellow-300' : 
    isValidSelection ? 'border-green-500' : ''
  }`;

  return (
    <div className="relative w-full">
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      options={{
        componentRestrictions: { country: ['es','mx'] },
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
      }}
    >
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={finalInputClassName}
          placeholder={placeholder}
          value={localValue}
          onChange={handleInputChange}
          data-valid-selection={isValidSelection}
        />
        
        {localValue && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        )}
        
        
        
      </div>
    </Autocomplete>
  </div>
);
}