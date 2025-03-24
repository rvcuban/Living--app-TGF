import React, { useEffect, useState } from 'react';


const PropertyMap = ({ listingAddress }) => {
    const [center, setCenter] = useState(null);
    const [loading, setLoading] = useState(true);


    return (
        <div className="property-map">
            <h2>Ubicación</h2>
            <div className="map-container">
                <div className="map-placeholder">
                    <p>Cargando mapa...</p>
                </div>
            </div>
        </div>
    );
};

export default PropertyMap;
