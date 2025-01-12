// src/components/UserItem.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle, FaMedal, FaStar } from 'react-icons/fa';

export default function UserItem({ user }) {
  const {
    _id,
    username,
    avatar,
    shortBio,
    badges = [],
    verified,
    averageRating,
    location,
  } = user;

  // Helper para renderizar estrellas (rating)
  const renderStars = (ratingValue) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <FaStar
          key={`star-${i}`}
          className={
            i < Math.round(ratingValue)
              ? 'text-yellow-400'
              : 'text-gray-300'
          }
        />
      );
    }
    return stars;
  };

  return (
    <div className="bg-white border-solid border-2 border-l-stone-300 rover:shadow-lg transition-shadow overflow-hidden rounded-xl w-full sm:w-[330px]">
      <Link to={`/user/${_id}/public`}>
        <div className="p-4 flex items-center">
          <img
            src={avatar || '/default-profile.png'}
            alt={`${username || 'Usuario'} avatar`}
            className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
          />
          <div className="ml-4">
            <div className="flex items-center">
              <p className="font-semibold text-slate-800">{username}</p>

              {verified && (
                <FaCheckCircle className="text-green-500 ml-2" title="Verificado" />
              )}

            </div>

            <div className="ml-4">
            <p className="text-sm text-gray-700 mt-1">Buscando en: {location}</p> {/* Nueva línea para ubicación */}
            </div>


            <div className="flex items-center mt-1">

              {renderStars(averageRating || 0)}
              <span className="ml-1 text-sm text-gray-600">({averageRating || 0})</span>
            </div>
          </div>
        </div>
        {/* Short Bio */}
        {shortBio && (
          <p className="text-sm text-gray-600 p-4 line-clamp-3">
            {shortBio}
          </p>
        )}
        {/* Badges */}
        {badges.length > 0 && (
          <div className="p-4 flex flex-wrap gap-2">
            {badges.map((badge, index) => (
              <span
                key={`badge-${index}`}
                className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full"
              >
                <FaMedal className="text-yellow-500" />
                {badge}
              </span>
            ))}
          </div>
        )}
      </Link>
    </div>
  );
}
