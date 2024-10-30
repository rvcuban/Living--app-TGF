import Listing from '../models/listing.model.js';
import { errorHandle } from '../utils/error.js';
import mongoose from 'mongoose';

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json({suceess:true ,listing});
  } catch (error) {
    next(error);
  }
};


export const deleteListing = async (req, res, next) => {
  const listing = await Listing.findById(req.params.id);

  if (!listing) {
    return next(errorHandle(404, 'Listing not found'));
  }

  if (req.user.id !== listing.userRef) {
    return next(errorHandle(401, 'Solo puedes borrrar tus propiedades'));
  }

  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json('la Propiedad ha sido eliminada');
  } catch (error) {
    next(error);

  }

};

export const updateListing = async (req, res, next) => {
  const { id } = req.params;

  // Validar si el ID es un ObjectId válido
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return next(errorHandle(400, 'Invalid listing ID')); // Si no es válido, devuelve un error 400
  }

  try {
    // Intentar encontrar y actualizar el listado
    const updatedListing = await Listing.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true }  // `new: true` para devolver el documento actualizado
    );

    // Si el listado no se encuentra, devolver un error 404
    if (!updatedListing) {
      return next(errorHandle(404, 'Listing not found'));
    }

    // Responder con el listado actualizado
    res.status(200).json(updatedListing);
  } catch (error) {
    // Si ocurre algún otro error, pasarlo al middleware de errores
    next(error);
  }
};



export const getListing = async (req, res, next) => {

  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
      return next(404, 'Listing not found');
    }

    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

//este va a ser parte del algortimo de search y voy a contruir aqui la paginacion y demas
export const getListings = async (req, res, next) => {

  try {
    //aqui limitamos el numero visible a 9 en caso de que no se haga una peticion en concreto a la url
    const limit = parseInt(req.query.limit) || 9;

    //indice de apginacion , si no se proporciona empezamos por 0
    const startIndex = parseInt(req.query.startIndex) || 0;
    let offer = req.query.offer;
    
    if (offer === undefined || offer === 'false') {
      offer = { $in: [false, true] };// aqui indicamos que la busqueda ne la base de datos si offer es false o no esta definido sera de todas, valores true y flase
    }

    let furnished = req.query.furnished;

    if (furnished === undefined || furnished === 'false') {
      furnished = { $in: [false, true] };
    }

    let parking = req.query.parking;

    if (parking === undefined || parking === 'false') {
      parking = { $in: [false, true] };
    }

    let type = req.query.type;

    if (type === undefined || type === 'all') {
      type = { $in: ['sale', 'rent'] };
    }

   const searchTerm = req.query.searchTerm || '';

    const sort = req.query.sort || 'createdAt';

    const order = req.query.order || 'desc';

    const listings = await Listing.find({ //busqueda
      address: { $regex: searchTerm, $options: 'i' },//regrex es la funcionalidad de buscar patrones en sitios de la base de datos, la opcion i indica que no le des importancia a las mayusculas y minisculas 
      offer,
      furnished,
      parking,
      type,

    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndex);//si es 0 empezaremos desde el principio pero si es otro nuemro empezaremos desde ahin ,, para eso sirve el skip

    return res.status(200).json(listings);


  } catch (error) {
    next(error);
  }
};