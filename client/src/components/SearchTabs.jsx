// src/components/SearchTabs.jsx

import React from 'react';

export default function SearchTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex border-b mb-4">
      <button
        className={`px-4 py-2 -mb-px font-semibold border-b-2 ${
          activeTab === 'listings'
            ? 'border-blue-500 text-blue-500'
            : 'border-transparent text-gray-600 hover:text-blue-500'
        }`}
        onClick={() => setActiveTab('listings')}
      >
        Alquiler
      </button>
      <button
        className={`px-4 py-2 -mb-px font-semibold border-b-2 ${
          activeTab === 'users'
            ? 'border-blue-500 text-blue-500'
            : 'border-transparent text-gray-600 hover:text-blue-500'
        }`}
        onClick={() => setActiveTab('users')}
      >
        Compañero
      </button>
    </div>
  );
}
