import React, { useRef, useState, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { FaTimes } from 'react-icons/fa';
import { useGoogleMapsApi } from '../utils/useGoogleMapsApi';

export default function SearchAutocompleteInput({
  value,
  onChange,
  onSelectPlace,
  onValidationChange,
  placeholder = 'Buscar dirección ...',
  inputClassName
}) {
  // Use the shared loader hook
  const { isLoaded, loadError } = useGoogleMapsApi();
  
  const [localValue, setLocalValue] = useState(value || '');
  const autocompleteRef = useRef(null);
  const [isValidSelection, setIsValidSelection] = useState(false);
  const inputRef = useRef(null);

  // Update local value when prop changes
  useEffect(() => {
    if (value !== localValue) {
      setLocalValue(value || '');
      // Reset validation status when value is set from outside
      setIsValidSelection(false);
    }
  }, [value, localValue]);

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
      try {
        const place = autocompleteRef.current.getPlace();
        if (place && place.formatted_address) {
          const formattedAddress = place.formatted_address || place.name;
          setLocalValue(formattedAddress);
          setIsValidSelection(true);
          if (onSelectPlace) {
            onSelectPlace(formattedAddress);
          }
        }
      } catch (error) {
        console.error("Error in onPlaceChanged:", error);
      }
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
    // Focus the input after clearing
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Add custom styles to the Google autocomplete dropdown
  useEffect(() => {
    if (isLoaded) {
      const styleId = 'google-places-style';
      const existingStyle = document.getElementById(styleId);
      
      if (!existingStyle) {
        const style = document.createElement('style');
        style.id = styleId;
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
      }
    }
    // No need to clean up styles since they should remain in document while the app is running
  }, [isLoaded]);

  // Handle loading state
  if (!isLoaded) {
    return (
      <input 
        type="text" 
        disabled 
        placeholder="Cargando Google Maps..." 
        className={inputClassName}
      />
    );
  }

  // Handle error state
  if (loadError) {
    console.error("Error loading Google Maps API:", loadError);
    return (
      <input 
        type="text" 
        placeholder="Error al cargar Google Maps" 
        className={`${inputClassName} border-red-500`}
        onChange={handleInputChange}
        value={localValue}
      />
    );
  }

  // Determine input class based on validation state
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
              className="absolute  right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </Autocomplete>
    </div>
  );
}