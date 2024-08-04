// eslint-disable-next-line no-unused-vars
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import SingIn from "./pages/SignIn";
import Profile from "./pages/Profile";

import Header from "./components/Header";
import SignUp from "./pages/SignUp"; 


export default function App() {
  return <BrowserRouter>
  <Header />
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/sign-in" element={<SingIn/>} />
      <Route path="/sign-up" element={<SignUp/>} />
      <Route path="/about" element={<About/>} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/" element={<Home />} />

    </Routes>
  </BrowserRouter>
}
