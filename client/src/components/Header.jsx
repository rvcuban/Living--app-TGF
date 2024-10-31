import { FaSearch } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from 'react-redux'
import { useEffect, useState, useRef } from "react";
import DropDownProfile from "./DropDownProfile";
import logo from '../assets/logo.jpg'




export default function Header() {
    const { currentUser } = useSelector(state => state.user);
    const [searchTerm, setSearchTerm] = useState('');// me permite esccribir en la barra de search(valor inicial empty string)

    const [openProfile, setOpenProfile] = useState(false);
    const navigate = useNavigate(); //inicilizamos el use-navegador para poder redirigir al usuario

    const dropdownRef = useRef(null); // Usamos useRef para referenciar el contenedor

    const handleSubmit = (e) => {
        e.preventDefault();//para cque no se haga refreasha  a la pagina
        const urlParams = new URLSearchParams(window.location.search); //Este es un metodo de react que mne permite mediante un constructor de java guardar el contenido de la url de la pagina
        // concrettamente me sirve por que ahi es donde va la infomracioin de la busqueda get?share=true...etc
        urlParams.set('searchTerm', searchTerm);
        const searchQuery = urlParams.toString(); // convertimos en sring porque peuden existir numeros y otras cosas º
        navigate(`/search?${searchQuery}`); // redirigimos a la url de la busqueda 

    }
    //ESTE SIRVE PARA CUANDO CCAMBIE ENTRE URLS SE QUEDA LA BSUQEDA EN LA ABRRA E SEARCH VISIBLE 
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchTermFromUrl = urlParams.get('searchTerm');
        if (searchTermFromUrl) { // si existe algun search term en la url seteamos el estado en ese srearchterm from url asi conservamos la bsuqueda de la pagina anterior 
            setSearchTerm(searchTermFromUrl);
        }

    }, [location.search])


    const handleProfileClick = (e) => {
        setOpenProfile(prev => !prev);
    };


    // Cerrar el menú al hacer clic fuera de él
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !event.composedPath().includes(dropdownRef.current)
            ) {
                setOpenProfile(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [openProfile]);


    




    return (

        //la razon del flex -wrap en el header es para que se vea bien en dispositivos mobiles
        //el from es la barra de busqueda de mometno noo tienen ningun action por qu no es necesario 
        //en el header classsName el shadow es para el fondo el header 
        //el div flex que lo envuelve a todo es debido a que quiero que aparezca la barra de budsqueda a la misma altura que el nombre de la pagina o marca  
        //debop recordar que las clases que estoy utilizandoson de tailwind css para luego poder remodelarlo a mi gusto mas tarde 
        //fasearch de la biblioteca fa de react icons me permite importar iconos y cambair su color  y demas 
        //con la funcion link de router react doom vamos a poder ir de una pagina a otra sin tener que refrescar 
        <header className='bg-slate-50 shadow-md relative z-50'>
            <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>
                <Link to='/'>

                    <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
                        <img src={logo} alt='Logo' className=' hidden md:block cursor-pointer h-8 w-8 mr-2' />
                        <span className='text-black'>Top</span>
                        <span className='text-red-700'>Secret</span>
                    </h1>
                </Link>
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
                <ul className='flex gap-4'>
                    <Link to='/'>
                        <li className="hidden sm:inline text-slate-700 hover:underline">Home</li>
                    </Link>

                    <Link to='/about'>
                        <li className="hidden sm:inline text-slate-700 hover:underline">About</li>
                    </Link>


                    <Link to='/create-listing'>
                        <li className="hidden sm:inline text-slate-700 hover:underline">Añade tu propiedad</li>
                    </Link>




                    <li className='relative' ref={dropdownRef}>

                        {currentUser ? (
                            <img
                                className='rounded-full h-7 w-7 object-cover'
                                src={currentUser.avatar} alt="profile"
                                onClick={handleProfileClick} />


                        ) : <Link to='/sign-in' className="text-slate-700 hover:underline">
                        Sign In
                    </Link>
                            }

                    {openProfile && <DropDownProfile />}
                </li>




            </ul>
        </div>

        </header >
    )
}
