import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";//importamos dotenv para pode rusar las variables de entorno en nuestro backend
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

//funcionando

app.listen(5000, () => {
    console.log("Server is running at port 5000!!!!")
}
);