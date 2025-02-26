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

import path from 'path';


// SOCKET.IO
import { createServer } from 'node:http';
import { Server } from 'socket.io';

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
app.use(express.json()); // esto nor permitira envir json al server 


app.use(cookieParser()); //libreria para tomar informacion de las coockies

/*
//funcionando
app.listen(5000, () => {
    console.log("Server is running at port 5000!!!!")
}
);
*/
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
      // msgObj debería tener algo como:
      {
        //content: string,
        //userId: string,
       // userName: string,
       // roomId: string (o conversationId)
       }
  
      try {
        // Guarda el mensaje en la base de datos
        const newMsg = await Message.create({
          content: msgObj.content,
          user: msgObj.userId,
          //  guardar el roomId/conversationId en DB
           conversationId: msgObj.roomId,
        });
  
        // Emitir solo a la sala "roomId"
        io.to(msgObj.roomId).emit('chat message', {
          _id: newMsg._id,
          content: newMsg.content,
          user: msgObj.userName || 'Anónimo',
          createdAt: newMsg.createdAt,
          roomId: msgObj.roomId
        });
      } catch (error) {
        console.error('Error guardando mensaje:', error);
      }
    });
  
    // 3) Manejar la desconexión
    socket.on('disconnect', () => {
      console.log('Usuario desconectado:', socket.id);
    });
  });
  
  // Iniciar el servidor
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}!!!!`);
  });