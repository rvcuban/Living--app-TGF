import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";//importamos dotenv para pode rusar las variables de entorno en nuestro backend
import UserRouter from './routes/user.routes.js';
import authRouter from './routes/auth.route.js';
dotenv.config();


mongoose.
    connect(process.env.MONGO)// ESTO ES PARA SETEAR LA CONTRASEÑA COMO VARIABLE DE ENTORNO

    .then(() => {// compruebo que he conectado correctamente con la abse de datos 

        console.log('Connected to MongoDB!');
    })
    .catch((err) => {
        console.log(err);
    });



const app = express();
app.use(express.json()); // esto nor permitira envir json al server 

//funcionando

app.listen(5000, () => {
    console.log("Server is running at port 5000!!!!")
}
);

app.use("/api/user", UserRouter);

app.use('/api/auth', authRouter);