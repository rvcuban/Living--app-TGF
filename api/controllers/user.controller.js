import { errorHandle } from "../utils/error.js";
import User from '../models/user.model.js';
import Listing from "../models/listing.model.js";
import bcryptjs from 'bcryptjs';

export const test = (req, res) => {
  res.json({
    message: 'api route'
  })
}

export const updateUser = async (req, res, next) => {
  console.log(req.user.id);
  console.log(req.params.id);
  if (req.user.id !== req.params.id) {// comparamos si la cookie del usuario obtenida tiene el mismo id del usaurio que esta requieriendo la actualizacion
    return next(errorHandle(401, 'You can only update your own account!'));//si no s asi mandamos un error 

  }
  //si el suaurio es correcto vamos a querer actualizar el usuario 
  try {
    //lo primero es que si el usaurio quiere cambiar su contraseña vamos a querer hshear la contraseña 
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }
    //ahora deberemos hacer un update al user 

    const updatedUser = await User.findByIdAndUpdate(  //metodo para hacer el update
      req.params.id,//le pasamos el id apra saber que usario vamos a hacer update
      {
        $set: {// el metodo sett se utiliza para comprobar si hay lgun cambio en el campo , si no lo hay ddeja el que estaba (de esta manera si el usaurio solo queire 
          username: req.body.username, //cambiar la photo o la contrraseña no es ncesario reeescribir todo u obteneer errores)

          email: req.body.email,
          password: req.body.password,
          avatar: req.body.avatar,
        },
      },
      { new: true }//retorna si si se a hcho el upate con nueva informacion
    );

    const { password, ...rest } = updatedUser._doc;//separamos la contraseña del resto 

    res.status(200).json(rest); // eenviamos el json con la ifnormacion 
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id)// recordar que params es el que se pasa por la url que es el id y el req.user.id lo obtenemos del verifyuser de la crpeta utils 
    return next(errorHandle(401, 'You can only delete your own account!'));
  try {
    await User.findByIdAndDelete(req.params.id);
    res.clearCookie('access_token');
    res.status(200).json('User has been deleted!');
  } catch (error) {
    next(error);
  }
};


export const getUserListings = async (req, res, next) => {
  if (req.user.id === req.params.id) { // si el usuario que hace la peticion es el mismo qu el usuario propietario quien creo la propiedad
    try {
      const listings = await Listing.find({ userRef: req.params.id }); //aqui ahcemos una busqueda de las propiedades que tiene el usuario que tiene esa misma user ref 
      res.status(200).json(listings);
    } catch (error) {
      next(error);
    }
  } else {
    return next(errorHandle(401, 'Solo puedes ver tus propiedades!'));
  }

};

export const getUser = async (req, res, next) => {
  try {

    const user = await User.findById(req.params.id);

    if (!user) return next(errorHandler(404, 'User not found!'));

    const { password: pass, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};