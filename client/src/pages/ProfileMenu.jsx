import { useState, useEffect,useRef } from "react";
import { User, Settings, Bell, HelpCircle, ChevronLeft, ChevronRight } from "lucide-react"; // Asegúrate de tener estos íconos
import Profile from './Profile'; // Ajusta las rutas según sea necesario
import SettingsContent from '../components/SettingsContent';
import NotificationsContent from '../components/NotificationsContent';
import HelpContent from '../components/HelpContent';
import SideBarMenu from '../components/SideBarMenu';



import { useDispatch, useSelector } from "react-redux"

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



export default function ProfileMenu() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [activeSection, setActiveSection] = useState('Mi Perfil');
    const [isSidebarOpen, setIsSidebarOpen] = useState(isMobile); // Sidebar visible en móviles



    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Detectar si es móvil
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Renderiza el contenido dependiendo de la sección activa
    const renderContent = () => {
        switch (activeSection) {
            case 'Mi Perfil':
                return <Profile/>;
            case 'Búsquedas Guardadas':
                return <SettingsContent />;
            case 'Aplicaciones':
                return <NotificationsContent />;
            case 'Pagos':
                return <HelpContent />;
            default:
                return <Profile/>;
        }
    };

    return (
        <div className={`flex ${isMobile ? 'flex-col' : 'h-screen'}`}>
            {/* Sidebar para dispositivos móviles */}
            {isSidebarOpen && isMobile ? (
                <div className="absolute inset-0 z-50 bg-white">
                    <SideBarMenu setActiveSection={setActiveSection} currentUser={currentUser} toggleSidebar={toggleSidebar} />
                </div>
            ) : (
                // Sidebar en pantallas grandes
                <SideBarMenu setActiveSection={setActiveSection} currentUser={currentUser} toggleSidebar={toggleSidebar} />
            )}

            {/* Contenido principal */}
            <div className={`${isMobile && isSidebarOpen ? 'hidden' : 'flex-grow p-5'} bg-white shadow-lg overflow-y-auto min-h-screen mx-auto`}>
                <h1 className="text-3xl font-semibold text-center my-7">{activeSection}</h1>
                {renderContent()}
            </div>
        </div>
    );
}

