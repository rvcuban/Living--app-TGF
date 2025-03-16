// eslint-disable-next-line no-unused-vars
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import SingIn from "./pages/SignIn";
import Profile from "./pages/Profile";

import BuildingPage from "./pages/BuildingPage";

import Header from "./components/Header";
import SignUp from "./pages/SignUp";
import PrivateRoute from "./components/PrivateRoute";
import CreateListing from "./pages/CreateListing";
import UpdateListing from "./pages/UpdateListing";
import Listing from "./pages/Listing";
import Search from "./pages/Search";

import RequestContent from "./components/RequestContent";
import MyProperties from "./pages/MyProperties";
import Aplications from "./pages/Aplications";
import MyApplications from "./pages/MyApplications";

import { ToastContainer } from 'react-toastify'; // Importar ToastContainer
import 'react-toastify/dist/ReactToastify.css';
import PropertyApplications from "./pages/PropertyApplications";

import PublicProfile from "./pages/PublicProfile";
import Chat from "./pages/Chat";
import MyBuddies from "./pages/MyBuddies";

import Onboarding from './components/Onboarding';

import ChatList from "./pages/ChatList";
import ChatConversation from './pages/ChatConversation';
import Footer from "./components/Footer";


import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { tokenExpired } from './redux/user/userSlice';
import { toast } from 'react-toastify';


export default function App() {

  const { currentUser } = useSelector(state => state.user);
  const dispatch = useDispatch();

  useEffect(() => {
    // Check token expiration periodically
    if (currentUser?.token) {
      const checkTokenExpiration = () => {
        try {
          const decoded = jwtDecode(currentUser.token);
          if (decoded.exp * 1000 < Date.now()) {
            toast.info('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
            dispatch(tokenExpired());
          }
        } catch (error) {
          console.error('Error checking token expiration:', error);
        }
      };

      // Check once when component mounts
      checkTokenExpiration();

      // Then set up interval to check periodically
      const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [currentUser, dispatch]);



  return (<BrowserRouter>
    <Header />
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/sign-in" element={<SingIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/about" element={<About />} />
      <Route path="/search" element={<Search />} />

      <Route path="/listing/:listingId" element={<Listing />} />

      {/* Ruta para el perfil público de un usuario */}
      <Route path="/user/:userId/public" element={<PublicProfile />} />

      <Route element={<PrivateRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />

        <Route path="/profile/*" element={<Profile />} />

        <Route path="/chat" element={<ChatList />} />
        <Route path="/chat/:conversationId" element={<ChatConversation />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/update-listing/:listingId" element={<UpdateListing />} />
        <Route path="/my-properties" element={<MyProperties />} />
        <Route path="/aplications" element={<Aplications />} />
        <Route path="/my_aplications" element={<MyApplications />} />
        <Route path="/listing/:listingId/applications" element={<PropertyApplications />} />

        <Route path="/my-roomies" element={<MyBuddies />} />


        <Route path="/request" element={<RequestContent />} />

      </Route>
      {/* Catch-all route for non-existent pages */}
      <Route path='*' element={<BuildingPage />} />

      <Route path="/" element={<Home />} />

    </Routes>
    <Footer />
    <ToastContainer /> {/* Contenedor de notificaciones */}
  </BrowserRouter>

  )
}
