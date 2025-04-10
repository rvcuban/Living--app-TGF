import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { signInStart } from '../redux/user/userSlice';
import { toast } from 'react-toastify';
import { FcGoogle } from "react-icons/fc";

export default function OAuth() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [clickTimeout, setClickTimeout] = useState(null);
  
  // Clear timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (clickTimeout) clearTimeout(clickTimeout);
    };
  }, [clickTimeout]);
  
  const handleGoogleSignIn = () => {
    // Prevent double-click handling
    if (isLoading || clickTimeout) return;
    
    setIsLoading(true);
    dispatch(signInStart());
    
    // Store current path for redirect after auth
    localStorage.setItem('authRedirectPath', window.location.pathname);
    
    // Set a brief timeout to prevent accidental double-clicks
    const timeout = setTimeout(() => {
      // Clear the timeout reference
      setClickTimeout(null);
      
      // Open Google OAuth popup directly
      const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
      
      // IMPORTANT: Get port dynamically from window.location
      const port = window.location.port || (window.location.protocol === 'https:' ? '443' : '80');
      
      // IMPORTANT: Fix to match EXACTLY what's in Google Cloud Console
      let redirectUri;
      
      if (window.location.hostname === 'localhost') {
        // For local development - Use HTTP instead of HTTPS
        redirectUri = `http://localhost:${port}/api/auth/google/callback`;
      } else if (window.location.hostname === 'livingapp-tgf.onrender.com') {
        // For render.com deployment
        redirectUri = 'https://livingapp-tgf.onrender.com/api/auth/google/callback';
      } else {
        // For production domain
        redirectUri = 'https://compitrueno.com/api/auth/google/callback';
      }
      
      console.log("Using redirect URI:", redirectUri);
      
      const params = {
        client_id: '590776902894-vms5oesvvmemmt9bqvug88gb4prhvbfc.apps.googleusercontent.com',
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'email profile',
        prompt: 'select_account',
        access_type: 'offline',
        state: window.location.pathname
      };
      
      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      // Open the Google authentication window
      window.location.href = `${googleAuthUrl}?${queryString}`;
    }, 300); // Brief timeout to prevent accidental double-clicks
    
    setClickTimeout(timeout);
    console.log("Frontend redirect URI:", redirectUri);
  };
  
  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading || clickTimeout}
      className="w-full flex items-center justify-center bg-white border border-gray-400 rounded-xl text-gray-800 font-medium py-3 px-6 shadow-sm hover:bg-gray-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <>
          <div className="animate-spin mr-2 h-5 w-5 border-2 border-gray-500 border-t-transparent rounded-full"></div>
          Conectando...
        </>
      ) : (
        <>
          <FcGoogle className="mr-2 h-6 w-6" />
          Continuar con Google
        </>
      )}
    </button>
  );
}