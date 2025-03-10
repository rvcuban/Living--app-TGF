import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch } from 'react-redux';
import { signInSuccess } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import { FcGoogle } from "react-icons/fc";
import api from '../utils/apiFetch';

export default function OAuth() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleGoogleClick = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);

      const res = await api('/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: result.user.displayName,
          email: result.user.email,
          photo: result.user.photoURL,
        }),
      });
      const data = await res.json();
      dispatch(signInSuccess(data));
      if (data.isNewUser) {
        navigate('/onboarding'); 
      } else {
        navigate('/');
      }
    } catch (error) {
      console.log('could not sign in with google', error);
    }
  };
  return (
    <button
      onClick={handleGoogleClick}
      type='button'
    className="w-full flex items-center justify-center bg-white border border-gray-400 rounded-xl text-gray-800 font-medium py-3 px-6  shadow-sm hover:bg-gray-200 transition-all duration-150 ease-in-out"
    >
          <FcGoogle className="mr-2 w-6 h-6 transition-transform duration-150 ease-in-out hover:rotate-6" />
    Continue with Google
  </button>

  );
}