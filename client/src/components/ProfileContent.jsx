import { useDispatch, useSelector } from "react-redux"
import { useRef, useState, useEffect } from 'react'; // para la imagen
import { getStorage, ref, getDownloadURL, uploadBytesResumable, } from 'firebase/storage';
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

import { Link } from 'react-router-dom';

import ProfileInfo from "../components/Profileinfo";
import { toast } from 'react-toastify'; // Importar toastimport { toast } from 'react-toastify'; // Importar toast




function ProfileContent() {
  const fileRef = useRef(null);
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [file, setFile] = useState(undefined);
  const [filePerc, setFilePerc] = useState(0);//iniciamos un estado para la barra de porcentaje cuando queremos subir una foto 
  const [fileUploadError, setFileUploadError] = useState(false); //control de errores para cuano subimos la foto
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState({
    username: currentUser.username || '',
    email: currentUser.email || '',
    location: currentUser.location || '',
    password: '', // Si deseas permitir cambiar la contraseña
    avatar: currentUser.avatar || '',
  }); //aqui guardamos la infomacion recogida sobre las propiedades del usuerio

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeSection, setActiveSection] = useState(''); // Estado para la sección activa

  const dispatch = useDispatch();

  console.log(formData);


  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);









  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);









  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);
  //cuando se cree una tarea de subir imagen (uploadTask)
  const handleFileUpload = (file) => {
    const storage = getStorage(app); // RENOCOCIMIENTO POR FIREBASE 
    const fileName = new Date().getTime() + file.name; //ESTO ES PARA HCER EL FILENAME UNICO
    const storageRef = ref(storage, fileName);
    const uploadTask = uploadBytesResumable(storageRef, file);
    //se pondra la tarea a on
    uploadTask.on(
      'state_changed',
      (snapshot) => {//informacion de state change(trackeara los cambios y nos dara la informacion mediante el snapchot)
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100; // asi obtenemos el porcenatje visual de subida
        setFilePerc(Math.round(progress));//aqui redondemos el porcentaje obtenido para no tener decimales
      },
      (error) => {
        setFileUploadError(true);
        toast.error('Error al subir la imagen. Inténtalo de nuevo.');
      },
      () => {//aqui finalmente tenemos el enlace de la imagen descargada 
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>//si
          setFormData({ ...formData, avatar: downloadURL }) //aqui trackeamos todos lo cmabios de la imagen y asignamos a la variable avatar la ruta de la imagen para hacer el cambio
        );
        toast.success('Avatar actualizado exitosamente.');
      }
    );
  };

  //basado en el id del input extraemos los cambios y los guardamos en el formData
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  //esta funcion es la encargada de mandarle la informacion al backend , e utiliza en el form 
  const handleSubmit = async (e) => {
    e.preventDefault(); // evitamos que se haga refresh de la apgina 
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, { // hacemos el fecth con el id del usuario a actualizar
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),//enviamos el form data por que aqui fue donde guardamos los cambios 
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        toast.error(data.message || 'Error al actualizar el perfil.');
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
      toast.success('Perfil actualizado exitosamente.');
    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };


  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch('/api/auth/signout');
      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(data.message));
    }
  };


  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();
      if (data.success === false) {
        setShowListingsError(true);
        return;
      }

      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }

      setUserListings((prev) =>
        prev.filter((listing) => listing._id !== listingId)
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className=''>
      {/* Contenido principal */}
        <h1 className='text-3xl font-semibold text-center my-7'>Profile</h1>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <input
            onChange={(e) => setFile(e.target.files[0])}
            type="file"
            ref={fileRef}
            hidden
            accept='image/*'
          />

          <div className="flex justify-center">
            <img onClick={() => fileRef.current.click()}
              src={formData.avatar || currentUser.avatar}
              alt="profile"
              className='object-cover rounded-full w-20 h-20 cursor-pointer '
            />

          </div>
        {/*
          <input type="text" placeholder='username' defaultValue={currentUser.username} id='username' className='border p-3 rounded-lg' onChange={handleChange} />
          <input type="email" placeholder='email' defaultValue={currentUser.email} id='email' className='border p-3 rounded-lg' onChange={handleChange} />
          <input type="password" placeholder='password' onChange={handleChange} id='password' className='border p-3 rounded-lg' />
        
          <button disabled={loading}
            className='bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80'>
            {loading ? ' Loading...' : 'Update'}
          </button>
        */ }


         
        </form>

        <ProfileInfo currentUser={currentUser} className="w-full" />

        <div className='flex justify-between mt-5'>
          <span onClick={handleDeleteUser} className='text-red-700 cursor-pointer'>Delete account</span>
          <span onClick={handleSignOut} className='text-red-700 cursor-pointer'>Sign out</span>
        </div>

        {userListings && userListings.length > 0 && (
          <div className='flex flex-col gap-4'>
            <h1 className='text-center mt-7 text-2xl font-semibold'>
              Your Listings
            </h1>
            {userListings.map((listing) => (
              <div
                key={listing._id}
                className='border rounded-lg p-3 flex justify-between items-center gap-4'
              >
                <Link to={`/listing/${listing._id}`}>
                  <img
                    src={listing.imageUrls[0]}
                    alt='listing cover'
                    className='h-16 w-16 object-contain'
                  />
                </Link>
                <Link className='text-slate-700 font-semibold hover:underline truncate flex-1' to={`/listing/${listing._id}`}>
                  <p>{listing.name}</p>
                </Link>
                <div className='flex flex-col'>
                  <button onClick={() => handleListingDelete(listing._id)} className='text-red-700 uppercase'>Delete</button>
                  <Link to={`/update-listing/${listing._id}`}>
                    <button className='text-green-700 uppercase'>Edit</button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      

    </div>
  );

}

export default ProfileContent;
