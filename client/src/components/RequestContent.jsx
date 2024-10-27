import React, { useState, useEffect } from 'react';

export default function RequestContent() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch('/api/requests', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch requests');
                }

                const data = await response.json();
                setRequests(data);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h2>Your Requests</h2>
            {requests.length > 0 ? (
                <ul>
                    {requests.map((request) => (
                        <li key={request._id}>
                            {/* Renderiza aquí los datos específicos de cada solicitud */}
                            <p>{request.propertyName}</p>
                            <p>Status: {request.status}</p>
                            {/* Otros detalles de la solicitud */}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No requests found.</p>
            )}
        </div>
    );
}
