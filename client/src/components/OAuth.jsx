import { useState, useEffect } from 'react';
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from "react-icons/fc";
import api from '../utils/apiFetch';

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // Add this state variable
  
  const handleGoogleClick = async () => {
    try {
      setIsLoading(true); // Set loading state to true when starting
      
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      
      // Add specific configuration to comply with Google's requirements
      provider.setCustomParameters({
        // Force account selection even if one account is available
        prompt: 'select_account',
        // Request standard OAuth scopes
        scope: 'profile email'
      });
      
      // CRITICAL: Use signInWithPopup instead of any redirect or custom flow
      const result = await signInWithPopup(auth, provider);
      
      const { displayName, email, photoURL } = result.user;
      
      // Send user data to backend
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: displayName,
          email,
          photo: photoURL,
        }),
        // Important: Send credentials for cookie handling
        credentials: 'include'
      });
      
      const data = await response.json();
      setIsLoading(false); // Set loading to false after request finishes
      
      if (data.success === false) {
        toast.error(data.message || "Error en autenticación con Google");
        return;
      }
      
      dispatch(signInSuccess(data));
      
      if (data.isNewUser) {
        navigate('/onboarding');
      } else {
        navigate('/');
      }
      
    } catch (error) {
      setIsLoading(false); // Set loading to false if there's an error
      console.error("Google sign-in error:", error);
      
      // Specific error message for the disallowed user agent
      if (error.code === 'auth/disallowed-useragent') {
        toast.error(
          "Google no permite iniciar sesión desde este navegador. Por favor usa Chrome, Firefox, Safari o Edge actualizado."
        );
      } else {
        toast.error("Error al iniciar sesión con Google. Por favor intenta de nuevo.");
      }
    }
  };
  
  return (
    <button
      onClick={handleGoogleClick}
      type='button'
      disabled={isLoading}
      className="w-full flex items-center justify-center bg-white border border-gray-400 rounded-xl text-gray-800 font-medium py-3 px-6 shadow-sm hover:bg-gray-200 transition-all duration-150 ease-in-out disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <div className="animate-spin mr-2 h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
          Connecting...
        </>
      ) : (
        <>
          <FcGoogle className="mr-2 w-6 h-6 transition-transform duration-150 ease-in-out hover:rotate-6" />
          Continue with Google
        </>
      )}
    </button>
  );
}