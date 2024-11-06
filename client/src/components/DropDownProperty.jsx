// DropDownProperty.jsx
import { Link } from "react-router-dom";

export default function DropDownProperty() {
  return (
    <div className='absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50'>
      <ul className='flex flex-col gap-1'>
        <li>
          <Link to='/my-properties' className='block px-4 py-2 text-gray-700 hover:bg-gray-100'>
           Ver mis Propiedades
          </Link>
        </li>
        <li>
          <Link to='/messages' className='block px-4 py-2 text-gray-700 hover:bg-gray-100'>
            Mensajes
          </Link>
        </li>
        <li>
          <Link to='/my-applications' className='block px-4 py-2 text-gray-700 hover:bg-gray-100'>
            Mis Aplicaciones
          </Link>
        </li>
      </ul>
    </div>
  );
}
