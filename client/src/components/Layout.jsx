// src/components/layout.jsx
import React from 'react';

export default function Layout({ heading, description, fields, button, back }) {
  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded shadow-sm space-y-4">
      {heading && (
        <h1 className="text-xl font-bold text-gray-800">{heading}</h1>
      )}
      {description && (
        <p className="text-gray-600">{description}</p>
      )}
      <div className="space-y-2">
        {fields}
      </div>
      <div className="flex items-center justify-between pt-4">
        {back || <div />} {/* si no hay back, dejamos un div vacío */}
        {button}
      </div>
    </div>
  );
}
