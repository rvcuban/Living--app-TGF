
import { Link, useNavigate } from "react-router-dom";


export default function DropDownProfile() {


  const handleSignOut = async () => {
    
  };



  return (
    <div className='absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg'>
    <ul className='flex flex-col gap-1'>
        <li>
            <Link to='/profile' className='block px-4 py-2 text-gray-700 hover:bg-gray-100'>
                Perfil
            </Link>
        </li>
        <li>
            <Link to='/saved-searches' className='block px-4 py-2 text-gray-700 hover:bg-gray-100'>
                Búsquedas Guardadas
            </Link>
        </li>
        <li>
            <Link to='/my-applications' className='block px-4 py-2 text-gray-700 hover:bg-gray-100'>
                Mis Aplicaciones
            </Link>
        </li>
        <li>
            <button
                onClick={handleSignOut}
                className='block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100'
            >
                Cerrar Sesión
            </button>
        </li>
    </ul>
</div>
);
}
