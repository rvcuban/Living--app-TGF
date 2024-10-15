import React from 'react';

function ProfileContent({ activeSection }) {
  return (
    <div className="p-4 flex-1">
      {activeSection === 'mi-perfil' && (
        <div>
          <h2 className="text-2xl font-semibold">Mi Perfil</h2>
          {/* Contenido del perfil */}
        </div>
      )}
      {activeSection === 'busquedas-guardadas' && (
        <div>
          <h2 className="text-2xl font-semibold">Búsquedas Guardadas</h2>
          {/* Contenido de búsquedas guardadas */}
        </div>
      )}
      {activeSection === 'aplicaciones' && (
        <div>
          <h2 className="text-2xl font-semibold">Aplicaciones</h2>
          {/* Contenido de aplicaciones */}
        </div>
      )}
      {activeSection === 'pagos' && (
        <div>
          <h2 className="text-2xl font-semibold">Pagos</h2>
          {/* Contenido de pagos */}
        </div>
      )}
      {activeSection === 'tus-resenas' && (
        <div>
          <h2 className="text-2xl font-semibold">Tus Reseñas</h2>
          {/* Contenido de reseñas */}
        </div>
      )}
      {activeSection === 'mis-documentos' && (
        <div>
          <h2 className="text-2xl font-semibold">Mis Documentos</h2>
          {/* Contenido de documentos */}
        </div>
      )}
    </div>
  );
}

export default ProfileContent;
