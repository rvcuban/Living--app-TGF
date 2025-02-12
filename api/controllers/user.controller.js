import { errorHandle } from "../utils/error.js";
import User from '../models/user.model.js';
import Listing from "../models/listing.model.js";
import bcryptjs from 'bcryptjs';
import { removeDiacritics } from "../utils/removeDiacritics.js";

export const test = (req, res) => {
  res.json({
    message: 'api route'
  })
}

export const updateUser = async (req, res, next) => {

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
          phone: req.body.phone,
          dateOfBirth: req.body.dateOfBirth,
          address: req.body.address,
          gender: req.body.gender,
          documentos: req.body.documentos,
          favoritos: req.body.favoritos,
          preferences: req.body.preferences,
          lookingForRoommate: req.body.lookingForRoommate,
          location: req.body.location
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

    if (!user) return next(errorHandle(404, 'User not found!'));

    const { password: pass, ...rest } = user._doc;

    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};

export const getPublicProfile = async (req, res, next) => {
  const { userId } = req.params;
  try {

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    // Retornar
    return res.status(200).json({ success: true, user });
  } catch (error) {
    console.error(error);
    return next(errorHandle(500, 'Error al obtener el perfil público.'));
  }
};



//esta es la logica de bsuqueda , es exactamente lo que diseñe para los listing pero para las personas 
export const getUsers = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;

    let {
      searchTerm = '',
      type = 'all',
      pets,
      smoker,
      schedule,
      verified,
      badges,
      location,
      sort = 'createdAt',
      order = 'desc',
    } = req.query;

    const filter = {};
    let normalizedLocation = "";

    // Búsqueda por término (username, bio, etc.)
    if (searchTerm) {
       
      filter.$or = [
        { location: { $regex: searchTerm, $options: 'i' } },
        
        // Añade más campos si es necesario
      ];
    }

    // Filtro por tipo
    if (type && type !== 'all') {
      filter.rol = type === 'landlord' ? 'Landlord' : 'Tenant';
    }

    // Filtros de preferencias
    if (pets === 'true' || pets === true) {
      filter['preferences.pets'] = true;
    }

    if (smoker === 'true' || smoker === true) {
      filter['preferences.smoker'] = true;
    }

    if (schedule) {
      filter['preferences.schedule'] = { $regex: schedule, $options: 'i' };
    }

    // Filtro de verificación
    if (verified === 'true' || verified === true) {
      filter.verified = true;
    }

    // Filtro por medallas
    if (badges) {
      const badgesArray = badges.split(',').map((badge) => badge.trim());
      filter.badges = { $all: badgesArray };
    }
    
 
    if (location) {
      // Filtrar por ubicación exacta 
      
    
      filter.locationNoAccent = { $regex: normalizedLocation, $options: 'i' };
    }

    // Ordenamiento
    const sortOptions = {};
    sortOptions[sort] = order === 'asc' ? 1 : -1;

    // Consulta a la base de datos
    const users = await User.find(filter)
      .collation({ locale: 'es', strength: 1 })
      .sort(sortOptions)
      .limit(limit)
      .skip(startIndex)
      .select('-password') // Excluir campos sensibles si los hay
      .lean(); // Optimización para lectura

    // Total de documentos para paginación 
    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: users,
      total,
      normalizedSearchTerm: normalizedLocation,
      message: users.length > 0 ? undefined : 'No se encontraron usuarios.',
    });
  } catch (error) {
    next(error);
  }
};


export const updateSetNewUser = async (req, res, next) => {
  try {
    // req.user.id es el user logueado, req.params.id es el user a actualizar...
    // verifica permisos si hace falta

    const { isNewUser, ...rest } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { ...rest, isNewUser } },
      { new: true }
    );

    return res.json({
      success: true,
      data: updated,
      message: "Usuario actualizado correctamente."
    });
  } catch (error) {
    next(error);
  }
};