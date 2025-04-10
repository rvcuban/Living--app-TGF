import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { toast } from 'react-toastify';

export default function AuthHandler() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);
  const processingRef = useRef(false);

  useEffect(() => {
    // Prevent multiple executions of authentication logic
    if (processingRef.current) return;

    const handleAuth = async () => {
      // Get URL parameters
      const params = new URLSearchParams(window.location.search);
      const login = params.get('login');
      const token = params.get('token');
      const userId = params.get('userId');
      const isNewUser = params.get('isNewUser') === 'true';
      const error = params.get('error');
      
      // Clean URL if needed
      if (login || error || token || userId) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // Handle Auth Error
      if (error) {
        console.error("Authentication error:", error);
        toast.error(`Error de autenticación: ${error}`);
        processingRef.current = false;
        return;
      }
      
      // Process successful login from URL params
      if (login === 'success' && token && userId && !currentUser) {
        console.log("Processing login from URL params");
        processingRef.current = true;
        
        try {
          // Store auth data
          localStorage.setItem('lastUserId', userId);
          localStorage.setItem('auth_token', token);
          
          // Fetch user data
          const response = await fetch(`/api/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (!response.ok) throw new Error(`HTTP error ${response.status}`);
          const userData = await response.json();
          
          // Update Redux store
          dispatch(signInSuccess({
            ...userData,
            token,
            isNewUser
          }));
          
          toast.success('¡Inicio de sesión exitoso!');
          
          // Use React Router navigation instead of window.location
          const redirectPath = isNewUser 
            ? '/onboarding'
            : localStorage.getItem('authRedirectPath') || '/';
          
          localStorage.removeItem('authRedirectPath');
          
          // Small delay to ensure Redux state is updated
          setTimeout(() => {
            navigate(redirectPath, { replace: true });
            processingRef.current = false;
          }, 100);
        } catch (err) {
          console.error("Error fetching user data:", err);
          toast.error("Error al obtener datos de usuario");
          processingRef.current = false;
        }
        return;
      }
      
      // Restore session from localStorage if not already logged in
      if (!currentUser) {
        const storedToken = localStorage.getItem('auth_token');
        const storedUserId = localStorage.getItem('lastUserId');
        
        if (storedToken && storedUserId) {
          console.log("Restoring session from localStorage");
          processingRef.current = true;
          
          try {
            const response = await fetch(`/api/user/${storedUserId}`, {
              headers: { 'Authorization': `Bearer ${storedToken}` }
            });
            
            if (!response.ok) throw new Error('Invalid token');
            const userData = await response.json();
            
            dispatch(signInSuccess({
              ...userData,
              token: storedToken
            }));
            
            processingRef.current = false;
          } catch (err) {
            console.error("Failed to restore session:", err);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('lastUserId');
            processingRef.current = false;
          }
        }
      }
    };
    
    handleAuth();
    
    // Cleanup
    return () => {
      processingRef.current = false;
    };
  }, [location.search, dispatch, navigate, currentUser]);

  return null;
}