import React, { useEffect, useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const mapContainerStyle = {
    width: '100%',
    height: '350px', // Ajusta la altura para móviles si es necesario
    borderRadius: 'var(--border-radius-medium)',
    boxShadow: 'var(--elevation-02)',
    overflow: 'hidden',
};

const PropertyMap = ({ listingAddress }) => {
    const [center, setCenter] = useState(null);
    const [loading, setLoading] = useState(true);

    // Geocodificación de la dirección
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
        if (listingAddress && window.google) {
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
    }, [listingAddress]);

    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            {loading ? (
                <p>Loading map...</p>
            ) : (
                <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={14}>
                    <Marker position={center} label="Property Location" />
                </GoogleMap>
            )}
        </LoadScript>
    );
};

export default PropertyMap;
