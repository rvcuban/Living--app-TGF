// src/components/GoogleLocationField.jsx
import React from 'react';
import { useController } from 'react-hook-form';
import SearchAutocompleteInput from './SearchAutocompleteInput';

export default function GoogleLocationField({ name, label, placeholder = "Buscar ubicación..." }) {
  // useController enlaza el nombre del campo con la logica de form
  const { field, fieldState } = useController({ name });

  return (
    <div className="mb-4">
      <label className="block text-gray-700 mb-2">
        {label}
      </label>
      <SearchAutocompleteInput
        value={field.value || ""}   // Valor actual del form
        onChange={(val) => field.onChange(val)} // Cuando el usuario escribe
        onSelectPlace={(val) => field.onChange(val)} // Cuando selecciona una sugerencia
        placeholder={placeholder}
        inputClassName="border p-2 w-full rounded"
      />
      {fieldState.error && (
        <p className="text-red-500 text-sm mt-1">
          {fieldState.error.message}
        </p>
      )}
    </div>
  );
}
