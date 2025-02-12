
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"
import { useRef, useState, useEffect } from 'react'; // para la imagen
import { getStorage, ref, getDownloadURL, uploadBytesResumable, deleteObject } from 'firebase/storage';
import { app } from '../firebase';

import {
    updateUserStart,
    updateUserSuccess,
    updateUserFailure,
    deleteUserFailure,
    deleteUserStart,
    deleteUserSuccess,
    signOutUserStart,
} from '../redux/user/userSlice';

export default function DropDownProfile({ onOptionSelect }) {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const fileRef = useRef(null);
    const { currentUser, loading, error } = useSelector((state) => state.user);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const [isgOut, setisOut] = useState(false);


    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            dispatch(signOutUserStart());
            const res = await fetch('/api/auth/signout');
            const data = await res.json();
            if (data.success === false) {
                dispatch(deleteUserFailure(data.message));
                setIsSigningOut(false);
                return;
            }
            setIsSigningOut(false);
            dispatch(deleteUserSuccess(data));
            setIsSigningOut(false);

            navigate('/sign-in');
            setTimeout(() => {
                window.location.reload(false);
            }, 300); // Retraso de 300 ms para asegurar la redirección
        } catch (error) {
            dispatch(deleteUserFailure(error.message));
            setIsSigningOut(false);
        }
    };



    return (
        <div className='absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50'>
            <ul className='flex flex-col gap-1'>
                <li>
                    <Link to='/profile' className='block px-4 py-2 text-gray-700 hover:bg-gray-100'>
                        Perfil
                    </Link>
                </li>
                <li>
                    <Link to='/saved-searches' className='block px-4 py-2 text-gray-700 hover:bg-gray-100' onClick={onOptionSelect}>
                        Búsquedas Guardadas
                    </Link>
                </li>
                <li>
                    <Link to='/my_aplications' className='block px-4 py-2 text-gray-700 hover:bg-gray-100' onClick={onOptionSelect}>
                        Mis Aplicaciones
                    </Link>
                </li>
                <li>
                    <Link to="/my-roomies" className='block px-4 py-2 text-gray-700 hover:bg-gray-100' onClick={onOptionSelect}>
                        Mis Compañeros
                    </Link>
                </li>
                <li>
                    <button
                        onClick={handleSignOut}
                        className='block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100'
                        disabled={isSigningOut}
                    >
                        {isSigningOut ? 'Cerrando Sesión...' : 'Cerrar Sesión'}
                    </button>
                </li>
            </ul>
        </div>
    );
}
