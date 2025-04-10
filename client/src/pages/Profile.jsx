import { useDispatch, useSelector } from "react-redux"
import { useRef, useState, useEffect } from 'react'; // para la imagen
import { getStorage, ref, getDownloadURL, uploadBytesResumable, } from 'firebase/storage';
import { app } from '../firebase';

import { Menu, X } from 'lucide-react'; // Importar los íconos de hamburguesa y cerrar

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
import UserInfo from "../components/UserInfo";
import ProfileInfo from "../components/Profileinfo";

import EmailIcon from '../assets/Email.png'; //icono usado en el email 
import SideBarMenu from "../components/SideBarMenu";
import ProfileContent from "../components/ProfileContent";

import RequestContent from "../components/RequestContent";
import Aplications from "./Aplications";
import { Routes, Route, Navigate,useLocation } from 'react-router-dom';


import { toast } from 'react-toastify'; // Importar toast
import PublicProfileEdit from "../components/PublicProfileEdit";




export default function Profile() {
 // Redux
 const { currentUser, loading, error } = useSelector((state) => state.user);
 const dispatch = useDispatch();

 // File upload states
 const fileRef = useRef(null);
 const [file, setFile] = useState(undefined);
 const [filePerc, setFilePerc] = useState(0);
 const [fileUploadError, setFileUploadError] = useState(false);
 
 // Profile states
 const [formData, setFormData] = useState({});
 const [updateSuccess, setUpdateSuccess] = useState(false);
 const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
 const [activeSection, setActiveSection] = useState('ProfileContent');
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);
 
 // Profile loading states - THESE WERE MISSING
 const [profileData, setProfileData] = useState(null);
 const [profileLoading, setProfileLoading] = useState(true);
 const [profileError, setProfileError] = useState(null);
 
 // Listings states
 const [showListingsError, setShowListingsError] = useState(false);
 const [userListings, setUserListings] = useState([]);

 console.log(formData);

   
  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);




 const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };




  // Detectar si es móvil
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser || !currentUser._id) {
        setProfileError("No hay usuario autenticado");
        setProfileLoading(false);
        return;
      }
  
      try {
        console.log("Fetching profile for user ID:", currentUser._id);
        
        // First try the /profile endpoint
        const res = await fetch(`/api/user/${currentUser._id}`, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${currentUser.token || ''}`
          }
        });
  
        if (!res.ok) {
          console.log("First endpoint failed, status:", res.status);
          
          // If first endpoint fails, try alternative endpoint
          const altRes = await fetch(`/api/user/profile/${currentUser._id}`, {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${currentUser.token || ''}`
            }
          });
          
          if (!altRes.ok) {
            throw new Error("No se pudo cargar el perfil del usuario");
          }
          
          const altData = await altRes.json();
          setProfileData(altData);
          console.log("Profile loaded from alt endpoint:", altData);
        } else {
          const data = await res.json();
          setProfileData(data);
          console.log("Profile loaded from main endpoint:", data);
        }
        
        setProfileLoading(false);
      } catch (error) {
        console.error("Error loading profile:", error);
        setProfileError(error.message);
        toast.error(`Error: ${error.message}`);
        setProfileLoading(false);
      }
    };
  
    fetchProfile();
  }, [currentUser]);







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
      },
      () => {//aqui finalmente tenemos el enlace de la imagen descargada 
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>//si
          setFormData({ ...formData, avatar: downloadURL }) //aqui trackeamos todos lo cmabios de la imagen y asignamos a la variable avatar la ruta de la imagen para hacer el cambio
        );
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
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);
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

  const renderContent = () => {
    switch (activeSection) {
      case 'ProfileContent':
       return <ProfileContent/>;
      case 'Búsquedas Guardadas':
      return <SettingsContent/>;
      case 'Aplications':
      return <Aplications />;
      case 'Pagos':
      // return <HelpContent />;
      default:
      // return <Profile/>;
    }
  };

 


  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'min-h-screen'}`}>
   <div className="container mx-auto flex flex-col md:flex-row ">
    {/* Sidebar para pantallas grandes o móviles cuando está abierto */}
    {(!isMobile || isSidebarOpen) && (
          <div className="md:w-1/4">
            <SideBarMenu
              currentUser={currentUser}
              toggleSidebar={toggleSidebar}
              setActiveSection={setActiveSection}
            />
          </div>
        )}

      {/* Contenido principal */}
      <div className="flex-grow w-full md:w-3/4 mt-4 md:mt-16 px-0 sm:px-4 p-0 sm:p-5 pb-20 bg-white rounded-xl">

      <Routes>
          <Route index element={<ProfileContent currentUser={currentUser} />} />
          <Route path="public" element={<PublicProfileEdit />} />
          <Route path="*" element={<Navigate to="/profile" replace />} />
        </Routes>

      </div>

      <div>
        
      </div>
      </div>
    </div>
  );

}