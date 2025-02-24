import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react'; // para la imagen



export default function SideBarMenu({ setActiveSection, currentUser, toggleSidebar }) {
  const fileRef = useRef(null);
  const navigate = useNavigate();
  // Controla la visibilidad del sidebar en dispositivos móviles


  // Menú lateral con secciones
  const menuItems = [
    { id: 'ProfileContent', name: 'Mi info', path: '/profile', icon: 'icon-classname' },
    { id: 'ProfileContent2', name: 'Mi Perfil Público', path: '/profile/public', icon: 'icon-classname' },
    { id: 'saved-searches', name: 'Búsquedas Guardadas', path: '/profile/saved-searches', icon: 'icon-classname' },
    { id: 'Aplications', name: 'Mis Solicitudes', path: '/profile/aplications', icon: 'icon-classname' },
    { id: 'payments', name: 'Pagos', path: '/profile/payments', icon: 'icon-classname' },
    { id: 'reviews', name: 'Mis Reseñas', path: '/profile/reviews', icon: 'icon-classname' },
    //{ id: 'documents', name: 'Mis Documentos', path: '/profile/documents', icon: 'icon-classname' },
 
  ];


  const handleMenuClick = (item) => {
    setActiveSection(item.id);
    toggleSidebar(); // Cierra el menú hamburguesa en móviles al hacer clic en una opción
    navigate(item.path);
  };


  return (                                                                                          //mt-12 md:mt16 son los que me dan el margin top con el header de la sidde bar
    <div className="font-poppins antialiased  w-full flex justify-end  items-start md:mt-16 ">
      {/* Contenedor que ocupará toda la pantalla */}
      <aside className="bg-white shadow-xl rounded-lg  w-full max-w-md flex flex-col lg:w-80 lg:p-4 lg:mr-10">
        <div className="space-y-6 md:space-y-10">
          {/* Logo */}
          <h1 className="font-bold text-xl text-center">
            Profile<span className="text-teal-600"></span>
          </h1>

          {/* Perfil del usuario */}
          <div id="profile" className="space-y-3">
            <img
              src={currentUser.avatar}
              alt="Avatar user"
              className="w-20 md:w-14 rounded-full mx-auto lg:w-16"
            />
            <div>
              <h2 className="font-medium text-sm md:text-lg text-center text-teal-500">
                {currentUser.username}
              </h2>
              <p className="text-xs text-gray-500 text-center">Rol</p>
            </div>
          </div>

          {/* Menú de navegación */}
          <nav>
            <ul className="space-y-4">
              {menuItems.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleMenuClick(item)} // Usa la función que cierra el menú y cambia la sección activa
                    className="text-base font-medium text-gray-700 py-3 px-4 bg-gray-50 hover:bg-teal-500 hover:text-white rounded-md transition duration-150 ease-in-out w-full text-center"
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  );
}