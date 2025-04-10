import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";//importamos dotenv para pode rusar las variables de entorno en nuestro backend
import UserRouter from './routes/user.routes.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import cookieParser from "cookie-parser";
import reviewRouter from './routes/review.routes.js';
import applicationRouter from './routes/application.route.js';
import userReviewRouter from './routes/userReview.route.js';
import roomMateRouter from './routes/roomMate.routes.js';
import messageRouter from './routes/message.route.js';
import { saveMessage } from './controllers/message.controller.js';
import { saveMessageFromSocket } from './controllers/message.controller.js';
import path from 'path';


// SOCKET.IO
import { createServer } from 'node:http';
import { Server } from 'socket.io';

import rateLimit from 'express-rate-limit';

// Importar el modelo de Mensaje (opcional)
import Message from './models/message.model.js'; // Te lo muestro luego

dotenv.config();


console.log("Cadena de conexión:", process.env.MONGO);
mongoose.
  connect(process.env.MONGO,)// ESTO ES PARA SETEAR LA CONTRASEÑA COMO VARIABLE DE ENTORNO

  .then(() => {// compruebo que he conectado correctamente con la abse de datos 

    console.log('Connected to MongoDB!');
  })
  .catch((err) => {
    console.log(err);
  });

const __dirname = path.resolve();

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

app.use(express.json()); // esto nor permitira envir json al server 

app.use(cookieParser()); //libreria para tomar informacion de las coockies

app.use(limiter); // Aplicar el limitador de tasa a todas las solicitudes para evitar ataques de denegación de servicio (DoS)
/*
//funcionando
app.listen(5000, () => {
    console.log("Server is running at port 5000!!!!")
}
);
*/

app.use((req, res, next) => {
  // Set security headers
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'interest-cohort=()');
  
  // For authentication flows
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  next();
});


// Add this for proper proxy handling
app.set('trust proxy', 1);

app.use((req, res, next) => {
  // Set appropriate headers for API responses
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googleapis.com https://*.firebaseio.com https://apis.google.com https://accounts.google.com https://www.gstatic.com; connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://securetoken.googleapis.com https://identitytoolkit.googleapis.com wss://*.firebaseio.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https://*.googleapis.com https://*.gstatic.com https://*.firebase.com data: https:; frame-src 'self' https://accounts.google.com https://*.firebaseauth.com;"
  );
  
  // IMPORTANT: Remove the Content-Security-Policy-Report-Only header if it exists
  res.removeHeader('Content-Security-Policy-Report-Only');
  
  next();
});

app.use("/api/user", UserRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);
app.use('/api/review', reviewRouter);
app.use('/api/userreview', userReviewRouter);
app.use('/api/applications', applicationRouter);
app.use('/api/roommate', roomMateRouter);
app.use('/api/chat', messageRouter);


app.use(express.static(path.join(__dirname, '/client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'dist', 'index.html')); //cualquer direccion  que no sea algfuna de mis apis v a a hacer run de index.html
});


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });


});

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true
  }
});
// Adjuntar io a la app para poder usarlo en rutas (opcional)
app.set('socketio', io);

// Configurar eventos de Socket.io
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  // 1) Únete a una sala
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} se unió a la sala ${roomId}`);
  });

  // 2) Al recibir mensaje, lo guardas en DB y envías a la sala

  socket.on('chat message', async (msgObj) => {
    try {
      console.log('Received message:', msgObj);
      
      if (!msgObj.userId) {
        console.error('⚠️ Missing userId in message');
        return;
      }
      
      if (!msgObj.roomId) {
        console.error('⚠️ Missing roomId in message');
        return;
      }
      
      // Create message using the controller
      const newMsg = await saveMessageFromSocket({
        content: msgObj.content,
        user: msgObj.userId,
        conversationId: msgObj.roomId
      });
      
      console.log('✅ Message saved successfully with ID:', newMsg._id);
      
      // Emit the saved message to all clients in the room
      io.to(msgObj.roomId).emit('chat message', {
        _id: newMsg._id,
        content: newMsg.content,
        user: {
          _id: msgObj.userId,
          username: msgObj.userName || 'Anónimo'
        },
        createdAt: newMsg.createdAt,
        roomId: msgObj.roomId
      });
    } catch (error) {
      console.error('❌ Error saving message:', error);
    }
  });

  // 3) Manejar la desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado:', socket.id);
  });
});

function startServerOnAvailablePort(initialPort, maxAttempts = 10) {
  let currentPort = initialPort;
  let attempts = 0;
  
  function tryPort() {
    if (attempts >= maxAttempts) {
      console.error(`Failed to find an available port after ${maxAttempts} attempts.`);
      process.exit(1);
      return;
    }
    
    attempts++;
    
    server.listen(currentPort, () => {
      console.log(`Server is running on port ${currentPort}!!!!`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${currentPort} is busy, trying port ${currentPort + 1}...`);
        currentPort++;
        tryPort();
      } else {
        console.error('Server error:', err);
      }
    });
  }
  
  tryPort();
}



// Start with your preferred port
const PORT = process.env.PORT || 5000;
startServerOnAvailablePort(PORT);