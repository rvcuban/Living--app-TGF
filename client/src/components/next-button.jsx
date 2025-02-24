// src/components/next-button.jsx
import React from 'react';

export default function NextButton({ children }) {
  return (
    <button
      type="submit"
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
    >
      {children || 'Siguiente'}
    </button>
  );
}
