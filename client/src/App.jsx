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
import ProfileMenu from "./pages/ProfileMenu";


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

      <Route element={<PrivateRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/profilemenu" element={<ProfileMenu />} />
        <Route path="/create-listing" element={<CreateListing />} />
        <Route path="/update-listing/:listingId" element={<UpdateListing />} />

      </Route>

      <Route path="/" element={<Home />} />

    </Routes>
  </BrowserRouter>
  )
}
