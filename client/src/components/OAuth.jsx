import { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { signInStart } from '../redux/user/userSlice';
import { toast } from 'react-toastify';
import { FcGoogle } from "react-icons/fc";

export default function OAuth() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [clickTimeout, setClickTimeout] = useState(null);
  const redirectUriRef = useRef('');
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout) clearTimeout(clickTimeout);
    };
  }, [clickTimeout]);
  
  const handleGoogleSignIn = () => {
    // Prevent double-click
    if (isLoading || clickTimeout) return;
    
    setIsLoading(true);
    dispatch(signInStart());
    
    // Store current path for after auth
    localStorage.setItem('authRedirectPath', window.location.pathname);
    
    // Set timeout to prevent double-clicks
    const timeout = setTimeout(() => {
      // Google OAuth URL
      const googleAuthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
      
      // Get the full host including port
      const hostname = window.location.hostname;
      const port = window.location.port;
      
      // Set redirect URI using the same logic as backend
      let redirectUri;
      
      if (hostname === 'localhost') {
        // Use HTTP for localhost with the exact port
        redirectUri = `http://localhost:${port}/api/auth/google/callback`;
      } else if (hostname === 'livingapp-tgf.onrender.com') {
        // For render.com
        redirectUri = 'https://livingapp-tgf.onrender.com/api/auth/google/callback';
      } else {
        // For production
        redirectUri = 'https://compitrueno.com/api/auth/google/callback';
      }
      
      // Save to ref for logging
      redirectUriRef.current = redirectUri;
      
      console.log("Initiating Google OAuth flow with redirect URI:", redirectUri);
      
      // Set OAuth parameters
      const params = {
        client_id: '590776902894-vms5oesvvmemmt9bqvug88gb4prhvbfc.apps.googleusercontent.com',
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'email profile',
        prompt: 'select_account',
        access_type: 'offline',
        state: window.location.pathname
      };
      
      // Build query string
      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      // Redirect to Google Auth
      window.location.href = `${googleAuthUrl}?${queryString}`;
    }, 300);
    
    setClickTimeout(timeout);
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