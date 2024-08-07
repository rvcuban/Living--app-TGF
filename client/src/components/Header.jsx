import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import {useSelector} from 'react-redux'

export default function Header() {
    const {currentUser} = useSelector(state=>state.user)
    return (

        //la razon del flex -wrap en el header es para que se vea bien en dispositivos mobiles
        //el from es la barra de busqueda de mometno noo tienen ningun action por qu no es necesario 
        //en el header classsName el shadow es para el fondo el header 
        //el div flex que lo envuelve a todo es debido a que quiero que aparezca la barra de budsqueda a la misma altura que el nombre de la pagina o marca  
        //debop recordar que las clases que estoy utilizandoson de tailwind css para luego poder remodelarlo a mi gusto mas tarde 
        //fasearch de la biblioteca fa de react icons me permite importar iconos y cambair su color  y demas 
        //con la funcion link de router react doom vamos a poder ir de una pagina a otra sin tener que refrescar 
        <header className='bg-slate-200 shadow-md'>
            <div className='flex justify-between items-center max-w-6xl mx-auto p-3'>
                <Link to='/'>

                    <h1 className='font-bold text-sm sm:text-xl flex flex-wrap'>
                        <span className='text-slate-500'>Sahan</span>
                        <span className='text-slate-700'>Sahan</span>
                    </h1>
                </Link>
                <form className='bg-slate-100 p-3 rounded-lg flex items-center' >
                    <input
                        type="text"
                        placeholder='Search...'
                        className='bg-transparent focus:outline-none w-24 sm:w-64'
                    />
                    <FaSearch className='text-slate-500' />
                </form>
                <ul className='flex gap-4'>
                    <Link to='/'>
                        <li className="hidden sm:inline text-slate-700 hover:underline">Home</li>
                    </Link>

                    <Link to='/about'>
                        <li className="hidden sm:inline text-slate-700 hover:underline">About</li>
                    </Link>
                    <Link to='/profile'>
                    {currentUser ?(
                        <img className='rounded-full h-7 w-7 object-cover' src={currentUser.avatar} alt="profile" />
                    ):  <li className=" text-slate-700 hover:underline">Sing In</li>}
                    
                       
                    </Link>
                </ul>
            </div>

        </header>
    )
}
