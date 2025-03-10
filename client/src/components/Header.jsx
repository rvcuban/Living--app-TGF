// Header.jsx
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux';
import { useEffect, useState, useRef } from "react";
import DropDownProfile from "./DropDownProfile";
import DropDownProperty from "./DropDownProperty";
import logo from '../assets/logo.jpg';
import { FaSearch } from "react-icons/fa";
import { useLocation } from "react-router-dom";


export default function Header() {
  const { currentUser } = useSelector(state => state.user);
  const [openProfile, setOpenProfile] = useState(false);
  const [openPropertyMenu, setOpenPropertyMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');// me permite esccribir en la barra de search(valor inicial empty string)
  const navigate = useNavigate(); //inicilizamos el use-navegador para poder redirigir al usuario

  const dropdownRef = useRef(null);
  const propertyMenuRef = useRef(null);

  //use efect par acada vez que se cambie de pagina se cierren los menus
  const location = useLocation();
  useEffect(() => {
    setOpenProfile(false);
    setOpenPropertyMenu(false);
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleProfileClick = () => {
    setOpenProfile(prev => !prev);
    setOpenPropertyMenu(false);
    setIsMobileMenuOpen(false);
  };

  const handlePropertyClick = () => {
    setOpenPropertyMenu(prev => !prev);
    setOpenProfile(false);
    setIsMobileMenuOpen(false);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(prev => !prev);
    setOpenProfile(false);
    setOpenPropertyMenu(false);
  };


  // Cerrar menús al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpenProfile(false);
      }
      if (
        propertyMenuRef.current &&
        !propertyMenuRef.current.contains(event.target)
      ) {
        setOpenPropertyMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openProfile, openPropertyMenu]);

  // Detectar si es móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const handleSubmit = (e) => {
    e.preventDefault();//para cque no se haga refreasha  a la pagina
    const urlParams = new URLSearchParams(window.location.search); //Este es un metodo de react que mne permite mediante un constructor de java guardar el contenido de la url de la pagina
    // concrettamente me sirve por que ahi es donde va la infomracioin de la busqueda get?share=true...etc
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString(); // convertimos en sring porque peuden existir numeros y otras cosas º
    navigate(`/search?${searchQuery}`); // redirigimos a la url de la busqueda 

  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) { // si existe algun search term en la url seteamos el estado en ese srearchterm from url asi conservamos la bsuqueda de la pagina anterior 
      setSearchTerm(searchTermFromUrl);
    }

  }, [location.search])





  return (
    <header className='bg-slate-50 shadow-md relative z-50'>
      <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>

        {/* Lado izquierdo: Logo o Menú Hamburguesa */}
        {/*<div className='flex items-center'>
          {isMobile ? (
            <button onClick={handleMobileMenuToggle}>
              <FaBars className='text-2xl text-gray-700' />
            </button>
          ) : (
            <Link to='/'>
              <h1 className='font-bold text-sm sm:text-xl flex items-center'>
                <img src={logo} alt='Logo' className='cursor-pointer h-8 w-8 mr-2' />
                <span className='text-black'>Wiki</span>
                <span className='text-red-700'>Home</span>
              </h1>
            </Link>
          )}
        </div>*/}

        <div className='flex items-center'>
          <Link to='/'>
            <h1 className='font-bold text-sm sm:text-xl flex items-center'>
              <img src={logo} alt='Logo' className='cursor-pointer h-8 w-8 mr-2' />
              <span className='text-black'>Wiki</span>
              <span className='text-red-700'>Home</span>
            </h1>
          </Link>
        </div>

        {/* formulario en el centro */}
        <form onSubmit={handleSubmit} className='bg-slate-100  p-3 rounded-lg flex items-center' >
          <input
            type="text"
            placeholder='Search...'
            className='bg-transparent focus:outline-none w-24 sm:w-64'
            value={searchTerm} //valor inical el de searchterm
            onChange={(e) => setSearchTerm(e.target.value)} //trackerar los cambios
          />
          <button>
            <FaSearch className='text-slate-500' />
          </button>

        </form>

        {/* Lado derecho: Icono de perfil o Sign In */}
        <div className='flex items-center'>
          {!isMobile && (
            <ul className='flex gap-4 items-center'>
              <li>
                <Link to='/' className="text-slate-700 hover:underline">Home</Link>
              </li>
              <li>
                <Link to='/chat' className="text-slate-700 hover:underline">Mis Chats</Link>
              </li>
             {/*  <li className='relative' ref={propertyMenuRef}>
                <button
                  className="text-slate-700 hover:underline focus:outline-none"
                  onClick={handlePropertyClick}
                >
                  Mis propiedades
                </button>
                {openPropertyMenu && <DropDownProperty />}
              </li>*/}
            </ul>
          )}
          <div className='relative ml-4' ref={dropdownRef}>
            {currentUser ? (
              <img
                className='rounded-full h-7 w-7 object-cover cursor-pointer'
                src={currentUser.avatar} alt="profile"
                onClick={handleProfileClick}
              />
            ) : (
              <Link to='/sign-in' className="text-slate-700 hover:underline">
                Iniciar Sesion
              </Link>
            )}
            {openProfile && <DropDownProfile />}
          </div>
        </div>
      </div>

      {/* Menú móvil que ocupa toda la pantalla */}
      {isMobileMenuOpen && isMobile && (
        <div className='fixed inset-0 bg-white z-50'>
          <div className='flex flex-col h-full'>
            {/* Header del menú móvil */}
            <div className='flex items-center justify-between p-4 border-b'>
              <h2 className='text-xl font-semibold'>Menú</h2>
              <button onClick={handleMobileMenuToggle}>
                <FaTimes className='text-2xl text-gray-700' />
              </button>
            </div>

            {/* Contenido del menú */}
            <div className='flex-1 overflow-y-auto'>
              <ul className='flex flex-col items-center mt-4'>
                <li className='text-slate-700 hover:underline py-2'>
                  <Link to='/' onClick={handleMobileMenuToggle}>Home</Link>
                </li>
                <li className='text-slate-700 hover:underline py-2'>
                  <Link to='/my-properties' onClick={handleMobileMenuToggle}>Gestionar mis inmuebles</Link>
                </li>
                <li className='text-slate-700 hover:underline py-2'>
                  <Link to='/my_aplications' onClick={handleMobileMenuToggle}>Mis Aplicaciones</Link>
                </li>
                <li className='text-slate-700 hover:underline py-2'>
                  <button
                    className='focus:outline-none'
                    onClick={handlePropertyClick}
                  >
                    Añade tu propiedad
                  </button>

                  {openPropertyMenu && <DropDownProperty />}

                </li>
                {currentUser ? (
                  <>
                    <li className='text-slate-700 hover:underline py-2'>
                      <Link to='/profile' onClick={handleMobileMenuToggle}>Perfil</Link>
                    </li>
                    <li className='text-slate-700 hover:underline py-2'>
                      <button
                        className='focus:outline-none'
                        onClick={handleProfileClick}
                      >
                        Opciones de Perfil
                      </button>
                      {openProfile && <DropDownProfile />}
                    </li>
                  </>
                ) : (
                  <li className='text-slate-700 hover:underline py-2'>
                    <Link to='/sign-in' onClick={handleMobileMenuToggle}>Sign In</Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
