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
  const [isLoading, setIsLoading] = useState(false);
  const [auth, setAuth] = useState(null);
  const [provider, setProvider] = useState(null);
  
  // Initialize Firebase Auth on component mount
  useEffect(() => {
    const authInstance = getAuth(app);
    const googleProvider = new GoogleAuthProvider();
    // Add scopes if needed
    googleProvider.addScope('email');
    googleProvider.addScope('profile');
    
    setAuth(authInstance);
    setProvider(googleProvider);
  }, []);
  
  const handleGoogleClick = async () => {
    if (isLoading) return; // Prevent multiple clicks
    
    try {
      setIsLoading(true);
      
      if (!auth || !provider) {
        console.error("Firebase auth not initialized");
        return;
      }
      
      // Use the pre-initialized auth and provider
      const result = await signInWithPopup(auth, provider);
      
      // Check if we have the required user data
      if (!result.user || !result.user.email) {
        throw new Error("No user data received from Google");
      }
      
      // Make the API call
      const res = await api('/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: result.user.displayName || '',
          email: result.user.email,
          photo: result.user.photoURL || '',
        }),
      });

      // Handle response
      const data = await res.json();
      
      if (!data || data.success === false) {
        throw new Error(data?.message || "Failed to sign in with Google");
      }
      
      dispatch(signInSuccess(data));
      
      // Navigate based on user status
      if (data.isNewUser) {
        navigate('/onboarding'); 
      } else {
        navigate('/');
      }
      
    } catch (error) {
      console.error("Google sign-in error:", error);
      alert("Error signing in with Google. Please try again.");
    } finally {
      setIsLoading(false);
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