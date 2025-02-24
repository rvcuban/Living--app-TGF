// src/components/text-field.jsx
import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function TextField({ name, label, placeholder }) {
  const { register, formState } = useFormContext();
  const error = formState.errors?.[name]?.message;

  return (
    <div className="flex flex-col">
      {label && <label className="font-medium text-gray-700">{label}</label>}
      <input
        {...register(name)}
        type="text"
        className="border border-gray-300 p-2 rounded"
        placeholder={placeholder || ''}
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  );
}
