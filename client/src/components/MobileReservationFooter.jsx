// MobileReservationFooter.jsx
import React from 'react';

export default function MobileReservationFooter({ listing, onReserve }) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white p-4 shadow-md lg:hidden">
      <div className=" flex items-center justify-start space-x-4 ml-10">
        <div>
          <p className="text-lg font-semibold text-sah-primary">
            {listing.offer
              ? `$${listing.discountPrice.toLocaleString('en-US')}`
              : `$${listing.regularPrice.toLocaleString('en-US')}`}
            {listing.type === 'rent' && ' / mes'}
          </p>
        </div>
        <button
          onClick={onReserve}
          className="bg-blue-500 text-white px-4 py-2 rounded-md uppercase hover:bg-blue-600 transition-colors"
        >
          {listing.type === 'rent' ? 'Reservar Ahora' : 'Comprar Ahora'}
        </button>
      </div>
    </div>
  );
}
