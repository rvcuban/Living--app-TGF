// Google Maps configuration to be used consistently across components
import { useJsApiLoader } from '@react-google-maps/api';

// Define libraries outside of component to prevent re-renders
export const libraries = ['places'];

// Consistent ID for the Google Maps script
export const GOOGLE_MAPS_SCRIPT_ID = 'google-maps-api-script';

// Hook to load Google Maps API consistently
export const useGoogleMapsApi = () => {
  return useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY_AUTOCOMPLETE,
    libraries,
    language: 'es',
    id: GOOGLE_MAPS_SCRIPT_ID, // Use the same ID every time
  });
};