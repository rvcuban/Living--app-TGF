// src/components/BubbleSelector.jsx
import React from 'react';
import { useFormContext } from 'react-hook-form';

/**
 * @param {string} name - nombre del campo en el formulario
 * @param {string} label - label opcional para el grupo
 * @param {Array<{ value: string; label: string }>} options - opciones para elegir
 */
export default function BubbleSelector({ name, label, options }) {
  const { setValue, watch } = useFormContext();
  const currentValue = watch(name);

  const handleSelect = (val) => {
    setValue(name, val, {
      shouldValidate: true, // Para forzar validación inmediata si lo deseas
      shouldDirty: true,
    });
  };

  return (
    <div className="flex flex-col space-y-2">
      {label && (
        <label className="font-medium text-gray-700">{label}</label>
      )}

      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = currentValue === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleSelect(opt.value)}
              className={`
                px-3 py-2 rounded-full border
                ${isActive ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-100 text-gray-700 border-gray-300'}
                transition-colors duration-200
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
