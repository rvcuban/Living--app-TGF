import { Link, useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react'; // para la imagen
import { FaLock } from 'react-icons/fa';


export default function SideBarMenu({ setActiveSection, currentUser, toggleSidebar }) {
  const fileRef = useRef(null);
  const navigate = useNavigate();
  // Controla la visibilidad del sidebar en dispositivos móviles


  // Menú lateral con secciones
  const menuItems = [
    { id: 'ProfileContent', name: 'Mi info', path: '/profile', icon: 'icon-classname', active: true },
    { id: 'ProfileContent2', name: 'Mi Perfil Público', path: '/profile/public', icon: 'icon-classname' , active: true},
    { id: 'saved-searches', name: 'Búsquedas', path: '/profile/saved-searches', icon: 'icon-classname', active: false },
    { id: 'Aplications', name: 'Mis Solicitudes', path: '/profile/aplications', icon: 'icon-classname', active: false },
    { id: 'payments', name: 'Pagos', path: '/profile/payments', icon: 'icon-classname' , active: false},
    { id: 'reviews', name: 'Mis Reseñas', path: '/profile/reviews', icon: 'icon-classname', active: false },
    //{ id: 'documents', name: 'Mis Documentos', path: '/profile/documents', icon: 'icon-classname' },
 
  ];


  const handleMenuClick = (item) => {
    if (item.active) {
      setActiveSection(item.id);
      toggleSidebar(); // Cierra el menú hamburguesa en móviles al hacer clic en una opción
      navigate(item.path);
    }
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
                    onClick={() => handleMenuClick(item)}
                    disabled={!item.active}
                    className={`
                      relative text-base font-medium py-3 px-4 rounded-md transition duration-150 ease-in-out w-full text-center
                      ${item.active 
                        ? 'bg-gray-50 text-gray-700 hover:bg-teal-500 hover:text-white cursor-pointer' 
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'}
                    `}
                  >
                    {item.name}

                    {!item.active && (
                      <div className="absolute inset-y-0 right-4 flex items-center">
                        <span className="flex items-center text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">
                          <FaLock className="mr-1" size={10} />
                          Próximamente
                        </span>
                      </div>
                    )}
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