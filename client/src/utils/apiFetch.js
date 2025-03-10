import axios from 'axios';
import { store } from '../redux/store';
import { tokenExpired } from '../redux/user/userSlice';
import { toast } from 'react-toastify';

// Create the axios instance
const axiosInstance = axios.create({
  baseURL: '/api',
  withCredentials: true
});

// Set up the interceptor
axiosInstance.interceptors.response.use(
  (response) => response, 
  (error) => {
    if (error.response && error.response.status === 401) {
      const currentUser = store.getState().user.currentUser;
      if (currentUser) {
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        store.dispatch(tokenExpired());
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

// Fetch-like wrapper function
const api = (url, options = {}) => {
  // Determine method (GET by default)
  const method = options.method?.toUpperCase() || 'GET';
  
  // Extract and format headers
  const headers = options.headers || {};
  
  // Extract data for POST/PUT/PATCH methods
  const data = options.body ? 
    (typeof options.body === 'string' ? JSON.parse(options.body) : options.body) : 
    undefined;
  
  // Map fetch params to axios config
  const config = {
    url,
    method,
    headers,
    data,
    withCredentials: options.credentials === 'include'
  };

  // Return a Promise that mimics the fetch API
  return axiosInstance(config).then(response => {
    // Create a fetch-like response object
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: () => Promise.resolve(response.data), // Make data() a method
      json: () => Promise.resolve(response.data),
      text: () => Promise.resolve(JSON.stringify(response.data))
    };
  });
};

// Add axios methods directly to api for new code
api.get = axiosInstance.get;
api.post = axiosInstance.post;
api.put = axiosInstance.put;
api.delete = axiosInstance.delete;
api.patch = axiosInstance.patch;

export default api;