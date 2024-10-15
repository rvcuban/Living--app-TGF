import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function SideBarMenu({setActiveSection}) {
  // Controla la visibilidad del sidebar en dispositivos móviles
  

  // Menú lateral con secciones
  const menuItems = [
    { name: 'Mi Perfil', icon: 'icon-classname' },
    { name: 'Búsquedas Guardadas', icon: 'icon-classname' },
    { name: 'Aplicaciones', icon: 'icon-classname' },
    { name: 'Pagos', icon: 'icon-classname' },
    { name: 'Tus Reseñas', icon: 'icon-classname' },
    { name: 'Mis Documentos', icon: 'icon-classname' },
  ];

  return (                                                                                          //mt-12 md:mt16 son los que me dan el margin top con el header de la sidde bar
    <div className="font-poppins antialiased   min-h-screen w-full flex justify-center items-center  md:mt-16">
    {/* Contenedor que ocupará toda la pantalla */}
    <aside className="bg-white shadow-xl p-6 w-full max-w-md h-full flex flex-col justify-between min-h-screen sm:min-h-[calc(100vh-64px)]">
      <div className="space-y-6 md:space-y-10">
        {/* Logo */}
        <h1 className="font-bold text-xl text-center">
          Mi App<span className="text-teal-600">.</span>
        </h1>

        {/* Perfil del usuario */}
        <div id="profile" className="space-y-3">
          <img
            src="https://via.placeholder.com/150"
            alt="Avatar user"
            className="w-20 md:w-32 rounded-full mx-auto"
          />
          <div>
            <h2 className="font-medium text-sm md:text-lg text-center text-teal-500">
              Nombre Usuario
            </h2>
            <p className="text-xs text-gray-500 text-center">Rol</p>
          </div>
        </div>

        {/* Menú de navegación */}
        <nav>
          <ul className="space-y-4">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={`/${item.name.toLowerCase().replace(/ /g, '-')}`}
                  className="text-base font-medium text-gray-700 py-3 px-4 bg-gray-50 hover:bg-teal-500 hover:text-white rounded-md transition duration-150 ease-in-out flex justify-center"
                >
                  {/* Icono correspondiente */}
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  </div>
);
}