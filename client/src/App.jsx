// eslint-disable-next-line no-unused-vars
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import SingIn from "./pages/SignIn";
import Profile from "./pages/Profile";


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


export default function App() {
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
        <Route path="/profile" element={<Profile />} />
        
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/update-listing/:listingId" element={<UpdateListing />} />
        <Route path="/my-properties" element={<MyProperties />} /> 
        <Route path="/aplications" element={<Aplications />} />
        <Route path="/my_aplications" element={<MyApplications />} />
        <Route path="/listing/:listingId/applications" element={<PropertyApplications />} />


        <Route path="/request" element={<RequestContent />} />

      </Route>

      <Route path="/" element={<Home />} />

    </Routes>
    <ToastContainer /> {/* Contenedor de notificaciones */}
  </BrowserRouter>
  
  )
}
