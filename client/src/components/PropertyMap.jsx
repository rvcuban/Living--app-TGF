import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
};

export default function PropertyMap({ properties, listingAddress }) {
  const [selectedView, setSelectedView] = useState('stars'); // Vista predeterminada
  const [markers, setMarkers] = useState([]);
  const [center, setCenter] = useState(null); // Estado para el centro del mapa (lat/lng)
  const [loading, setLoading] = useState(true);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Función para convertir una dirección en coordenadas
  const geocodeAddress = async (address) => {
    const geocoder = new window.google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK') {
          const { lat, lng } = results[0].geometry.location;
          resolve({ lat: lat(), lng: lng() });
        } else {
          reject(`Geocode failed: ${status}`);
        }
      });
    });
  };

  useEffect(() => {
    // Convertir la dirección del listing a coordenadas
    if (listingAddress && isScriptLoaded) {
      geocodeAddress(listingAddress)
        .then((coords) => {
          setCenter(coords);
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
        });
    }
  }, [listingAddress, isScriptLoaded]);

  useEffect(() => {
    // Configurar marcadores según la vista seleccionada
    switch (selectedView) {
      case 'stars':
        setMarkers(getStarMarkers(properties));
        break;
      case 'neighbours':
        setMarkers(getNeighbourMarkers(properties));
        break;
      case 'utilities':
        setMarkers(getUtilityMarkers(properties));
        break;
      default:
        setMarkers([]);
    }
  }, [selectedView, properties]);

  const getStarMarkers = (properties) => {
    return properties.map((property) => ({
      position: {
        lat: property.location.lat,
        lng: property.location.lng,
      },
      icon: {
        url: 'https://example.com/star-icon.png',
        scaledSize: { width: 40, height: 40 },
      },
      label: `${property.averageRating} ★`,
    }));
  };

  const getNeighbourMarkers = (properties) => {
    return properties.map((property) => ({
      position: {
        lat: property.location.lat,
        lng: property.location.lng,
      },
      icon: {
        url: 'https://example.com/neighbor-icon.png',
        scaledSize: { width: 40, height: 40 },
      },
      label: property.neighbours.join(', '),
    }));
  };

  const getUtilityMarkers = (properties) => {
    return properties.map((utility) => ({
      position: {
        lat: utility.location.lat,
        lng: utility.location.lng,
      },
      icon: {
        url: 'https://example.com/utility-icon.png',
        scaledSize: { width: 40, height: 40 },
      },
      label: utility.utilities.join(', '),
    }));
  };

  return (
    <div>
      <div className="view-selector">
        <button onClick={() => setSelectedView('stars')}>Stars View</button>
        <button onClick={() => setSelectedView('neighbours')}>Neighbours View</button>
        <button onClick={() => setSelectedView('utilities')}>Utilities View</button>
      </div>

      {loading ? (
        <p>Loading map...</p>
      ) : (
        <LoadScript
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          onLoad={() => setIsScriptLoaded(true)}
        >
          {center && (
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={13}>
              {markers.map((marker, index) => (
                <Marker
                  key={index}
                  position={marker.position}
                  icon={marker.icon}
                  label={marker.label}
                />
              ))}
            </GoogleMap>
          )}
        </LoadScript>
      )}
    </div>
  );
}