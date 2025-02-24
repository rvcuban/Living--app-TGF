// src/components/back-button.jsx
import React from 'react';
import { useMultiStep } from '../multi-steps/multi-step-context';

export default function BackButton({ children }) {
  const { onBack, getValues } = useMultiStep();

  const handleClick = () => {
    // getValues() obtiene los valores actuales del formulario
    onBack(getValues());
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
    >
      {children || 'Atrás'}
    </button>
  );
}
