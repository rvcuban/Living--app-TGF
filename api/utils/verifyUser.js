import jwt from 'jsonwebtoken';
import {errorHandle } from './error.js';


//modulo creado para comprobar si el token web generado es correcto y podamos hacerle despues update a los datos del usuario en la base de datos 
export const verifyToken = (req, res, next) => {
  const token = req.cookies.access_token;// pedimos le nombre del token

  if (!token) return next(errorHandle(401, 'Unauthorized')); // si no hay token damos error con el middleware que hemos creaddo

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {//si hay toque debemos comprabr si el token es correcto o  no
    if (err) return next(errorHandle(403, 'Forbidden'));

    req.user = user; // hacemos esto para ahora en el nect enviar el suaurio a la siguiente aprte para verificarlo dado que el token es correcto
   
    next();
  });
};