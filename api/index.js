import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";//importamos dotenv para pode rusar las variables de entorno en nuestro backend
import UserRouter from './routes/user.routes.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';
import cookieParser from "cookie-parser";
import reviewRouter from './routes/review.routes.js';
import applicationRouter from './routes/application.route.js';


import path from 'path';
dotenv.config();


mongoose.
    connect(process.env.MONGO)// ESTO ES PARA SETEAR LA CONTRASEÑA COMO VARIABLE DE ENTORNO

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

//funcionando
app.listen(5000, () => {
    console.log("Server is running at port 5000!!!!")
}
);

app.use("/api/user", UserRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing',listingRouter);
app.use('/api/review', reviewRouter);
app.use('/api/applications', applicationRouter); 


app.use(express.static(path.join(__dirname, '/client/dist')));
app.get ('*', (req,res)=>{
    res.sendFile(path.join(__dirname, 'client','dist','index.html')); //cualquer direccion  que no sea algfuna de mis apis v a a hacer run de index.html
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