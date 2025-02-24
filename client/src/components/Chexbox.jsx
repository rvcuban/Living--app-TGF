// src/components/checkbox.jsx
import React from 'react';
import { useFormContext } from 'react-hook-form';

export default function Checkbox({ name, label }) {
  const { register, formState } = useFormContext();
  const error = formState.errors?.[name]?.message;

  return (
    <div className="flex items-center space-x-2">
      <input
        {...register(name)}
        type="checkbox"
        className="h-4 w-4 rounded border-gray-300"
      />
      <label className="text-gray-700">{label}</label>
      {error && <p className="text-red-600 text-sm">{error}</p>}
    </div>
  );
}
