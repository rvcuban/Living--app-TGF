import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  server:{
    
    proxy:{
      '/api':{
        target:'http://localhost:5000',
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
    headers: {
      'Content-Security-Policy': "default-src 'self'; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebase.com https://*.firebaseauth.com wss://*.firebaseio.com http://localhost:*; script-src 'self' 'unsafe-inline' https://*.firebaseio.com https://*.googleapis.com 'unsafe-eval'; frame-src 'self' https://*.firebaseauth.com https://accounts.google.com; img-src 'self' https: data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:;"
    }
  },
  plugins: [react()],
});
