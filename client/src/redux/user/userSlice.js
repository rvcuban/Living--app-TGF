
import { createSlice } from "@reduxjs/toolkit";
import{ jwtDecode } from 'jwt-decode';
//El objetivo de esta modificacion es controlar cuando un usuario esta logueado o no ,actualmente no 
//se chequea si el token ha expirado o no, por lo que si el token expira el usuario sigue logueado
// Helper function to check token expiration
const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 < Date.now();
    } catch (e) {
      return true;
    }
  };
  
  // Helper to get stored user data
  const getInitialState = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      // Check token expiration on page load/refresh
      if (userData.token && isTokenExpired(userData.token)) {
        localStorage.removeItem('user');
        return { currentUser: null, loading: false, error: null };
      }
      return { currentUser: userData, loading: false, error: null };
    }
    return { currentUser: null, loading: false, error: null };
  };


const initialState = getInitialState();


const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        signInStart: (state) => {
            state.loading = true;
        },
        signInSuccess: (state, action) => { // action nes la informacion que recibimos de la base de datos 
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
        signInFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        }, updateUserStart: (state) => {
            state.loading = true;
        },
        updateUserSuccess: (state, action) => {
            state.currentUser = action.payload;
            state.loading = false;
            state.error = null;
            localStorage.setItem('user', JSON.stringify(action.payload));
        },
        updateUserFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        deleteUserStart: (state) => {
            state.loading = true;
        },
        deleteUserSuccess: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('user');
        },
        deleteUserFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        signOutUserStart: (state) => {
            state.loading = true;
        },
        signOutUserSuccess: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('user');
        },
        signOutUserFailure: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        },
        tokenExpired: (state) => {
            state.currentUser = null;
            state.loading = false;
            state.error = null;
            localStorage.removeItem('user');
          }
    },
});

export const {
    signInStart,
    signInSuccess,
    signInFailure,
    updateUserFailure,
    updateUserSuccess,
    updateUserStart,
    deleteUserFailure,
    deleteUserSuccess,
    deleteUserStart,
    signOutUserFailure,
    signOutUserSuccess,
    signOutUserStart,
    tokenExpired,
} = userSlice.actions;
export default userSlice.reducer;


