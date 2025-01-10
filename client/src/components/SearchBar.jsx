// src/components/SearchBar.jsx

import React, { useEffect, useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SearchBar({ activeTab }) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Maneja la persistencia del término de búsqueda en la URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);

    // Añadir el tipo de búsqueda a los parámetros
    urlParams.set('type', activeTab);

    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative bg-white shadow-lg rounded-full p-1 w-full max-w-xl flex items-center mx-auto"
    >
      <input
        placeholder="Buscar destinos..."
        className="bg-transparent focus:outline-none w-full sm:w-64 px-4 py-3 text-gray-600 rounded-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button
        type="submit"
        className="absolute right-1 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition duration-200"
      >
        <FaSearch />
      </button>
    </form>
  );
}
