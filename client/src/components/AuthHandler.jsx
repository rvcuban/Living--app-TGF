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
      const details = params.get('details');
      
      // Clean URL parameters regardless
      if (login || error || token || userId) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      // Handle errors more descriptively
      if (error) {
        console.error("Authentication error:", error, details ? `- ${details}` : '');
        
        let errorMessage = "Error de autenticación";
        
        switch(error) {
          case 'token_exchange':
            errorMessage = "Error al validar tu identidad con Google. Esto puede deberse a una configuración incorrecta o a que la sesión ha expirado.";
            if (details) {
              console.error("Token exchange details:", details);
            }
            break;
          case 'no_code':
            errorMessage = "No se recibió un código de autorización de Google.";
            break;
          case 'user_info':
            errorMessage = "No se pudo obtener tu información de usuario de Google.";
            break;
          case 'user_creation':
            errorMessage = "Error al crear tu cuenta de usuario.";
            break;
          case 'missing_secret':
            errorMessage = "Error de configuración del servidor. Contacta al administrador.";
            break;
          default:
            errorMessage = `Error de autenticación: ${error}`;
        }
        
        toast.error(errorMessage);
        return;
      }
      
      // Handle successful login
      if (login === 'success' && token && userId) {
        console.log("Processing successful login, new user:", isNewUser);
        
        // Store auth data
        localStorage.setItem('lastUserId', userId);
        localStorage.setItem('auth_token', token);
        
        // Fetch user data
        fetch(`/api/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        .then(res => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          return res.json();
        })
        .then(userData => {
          if (userData) {
            // Update Redux store
            dispatch(signInSuccess({
              ...userData,
              token,
              isNewUser
            }));
            
            toast.success('¡Inicio de sesión exitoso!');
            
            // Redirect based on user status
            if (isNewUser) {
              window.location.href = '/onboarding';
            } else {
              const redirectPath = localStorage.getItem('authRedirectPath') || '/';
              localStorage.removeItem('authRedirectPath');
              window.location.href = redirectPath;
            }
          }
        })
        .catch(err => {
          console.error("Error fetching user data:", err);
          toast.error("Error al obtener tus datos de usuario. Intenta nuevamente más tarde.");
        });
      }
    };
    
    // Try to restore session from localStorage if not logged in
    const restoreSession = () => {
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
            if (!res.ok) throw new Error(`HTTP error ${res.status}`);
            return res.json();
          })
          .then(userData => {
            if (userData) {
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
    
    processAuthParams();
    restoreSession();
  }, [location.search, dispatch, currentUser]);

  return null; // No UI
}