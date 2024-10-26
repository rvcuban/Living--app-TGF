import React, { useState } from 'react';

export default function ReservationCard({ listingType }) {
    const [rentalDuration, setRentalDuration] = useState(3);

    const handleDurationChange = (event) => {
        setRentalDuration(event.target.value);
    };

    return (
        <div className="bg-white p-6 shadow-lg rounded-lg mt-6 border border-gray-300">
            <h3 className="text-3xl font-bold text-center mb-4">
                {listingType === 'rent' ? 'Reserve Now' : 'Buy Now'}
            </h3>
            {listingType === 'rent' && (
                <select
                    className="w-full p-3 mt-3 border border-gray-300 rounded-lg bg-slate-100 text-slate-600"
                    value={rentalDuration}
                    onChange={handleDurationChange}
                >
                    {[3, 6, 9, 12, 24].map((months) => (
                        <option key={months} value={months}>
                            {months} {months === 1 ? 'month' : 'months'}
                        </option>
                    ))}
                </select>
            )}
            <button
                className="bg-blue-600 text-white w-full p-3 mt-6 rounded-lg hover:bg-blue-500 transition-colors"
            >
                {listingType === 'rent' ? 'Reserve Now' : 'Contact to Buy'}
            </button>
        </div>
    );
}

