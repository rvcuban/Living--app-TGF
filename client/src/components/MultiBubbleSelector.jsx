// src/components/MultiBubbleSelector.jsx
import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function MultiBubbleSelector({ name, label, options }) {
  const { watch, setValue } = useFormContext();
  const currentValues = watch(name) || []; // array de valores

  const handleToggle = (val) => {
    if (currentValues.includes(val)) {
      // Si ya está, lo removemos
      setValue(
        name,
        currentValues.filter((v) => v !== val),
        { shouldValidate: true, shouldDirty: true }
      );
    } else {
      // Si no está, lo agregamos
      setValue(name, [...currentValues, val], {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      {label && <label className="font-medium text-gray-700">{label}</label>}

      {/* flex-wrap para que se ajusten en varias líneas al ser muchas */}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const isActive = currentValues.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleToggle(opt.value)}
              className={`
                px-3 py-2 rounded-full border
                ${
                  isActive
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-gray-100 text-gray-700 border-gray-300'
                }
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
