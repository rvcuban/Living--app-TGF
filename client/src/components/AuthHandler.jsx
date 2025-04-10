import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { toast } from 'react-toastify';

export default function AuthHandler() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    // Process URL query parameters after OAuth redirect
    const processAuthParams = () => {
      const params = new URLSearchParams(window.location.search);
      const login = params.get('login');
      const token = params.get('token');
      const userId = params.get('userId');
      const isNewUser = params.get('isNewUser') === 'true';
      const error = params.get('error');
      
      // Only process if we have auth params and not already logged in
      if ((login || error) && !currentUser) {
        console.log("Processing auth params:", { login, token, userId, isNewUser, error });
        
        // Clean URL params
        window.history.replaceState({}, document.title, window.location.pathname);
        
        if (error) {
          toast.error(`Error de autenticación: ${error}`);
          return;
        }
        
        if (login === 'success' && token && userId) {
          // Store userId for recovery
          localStorage.setItem('lastUserId', userId);
          localStorage.setItem('auth_token', token);
          
          // Fetch user data using token
          fetch(`/api/user/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          .then(res => res.json())
          .then(userData => {
            if (userData) {
              // Update Redux store with user data
              dispatch(signInSuccess({
                ...userData,
                token,
                isNewUser
              }));
              
              toast.success('¡Inicio de sesión exitoso!');
              
              // Redirect based on user status
              if (isNewUser) {
                // For new users, redirect to onboarding
                window.location.href = '/onboarding';
              } else {
                // Get stored redirect path or default to home
                const redirectPath = localStorage.getItem('authRedirectPath') || '/';
                localStorage.removeItem('authRedirectPath');
                
                // Use full page navigation to prevent React Router issues
                window.location.href = redirectPath;
              }
            }
          })
          .catch(err => {
            console.error("Error fetching user data:", err);
            toast.error("Error al obtener datos del usuario");
          });
        }
      }
    };
    
    // Check for persisted auth without redirect
    const checkPersistedAuth = () => {
      // If not logged in but we have a token in localStorage, try to restore session
      if (!currentUser) {
        const token = localStorage.getItem('auth_token');
        const userId = localStorage.getItem('lastUserId');
        
        if (token && userId) {
          console.log("Attempting to restore session from localStorage");
          
          fetch(`/api/user/${userId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
          .then(res => {
            if (!res.ok) {
              throw new Error('Invalid token');
            }
            return res.json();
          })
          .then(userData => {
            if (userData) {
              // Update Redux store with user data
              dispatch(signInSuccess({
                ...userData,
                token
              }));
              console.log("Session restored successfully");
            }
          })
          .catch(err => {
            console.error("Failed to restore session:", err);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('lastUserId');
          });
        }
      }
    };
    
    // Run both checks
    processAuthParams();
    checkPersistedAuth();
  }, [location.search, dispatch, currentUser]);

  // This is a utility component with no UI
  return null;
}