import Listing from '../models/listing.model.js';
import { errorHandle } from '../utils/error.js';
import mongoose from 'mongoose';
import {cancelApplication,getUserApplications,createApplication,updateApplication} from './application.controller.js';

function removeDiacritics(str) {
  return str
    .normalize('NFD')          // Descompone tildes, e.g. "á" -> "a" + diacrítico
    .replace(/[\u0300-\u036f]/g, '');  // Elimina los diacríticos
}

export const createListing = async (req, res, next) => {
  try {
    const listing = await Listing.create(req.body);
    return res.status(201).json(listing);
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

//obetenr las rutas de un usuario en especifico 
export const getUserListings = async (req, res, next) => {
  try {
    console.log('req.user:', req.user);
    const listings = await Listing.find({ userRef: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(listings);
  } catch (error) {
    console.error('Error en getUserListings:', error);
    next(error);
  }
};

// controllers/property.controller.js

export const getPropertySummary = async (req, res, next) => {
  try {
    const {id} = req.params;
    const property = await Listing.findById(id)
      .populate('applications', '_id status')
      .populate('residentesActuales', '_id')
      .exec();

    if (!property) {
      return res.status(404).json({ success: false, message: 'Propiedad no encontrada.' });
    }
  
    const applicationsCount = property.applications ? property.applications.length : 0;
    const membersCount = property.residentesActuales ? property.residentesActuales.length : 0;
    const capacity = property.bedrooms;

    res.status(200).json({
      success: true,
      data: {
        applicationsCount,
        membersCount,
        capacity,
      },
    });
  } catch (error) {
    console.error('Error al obtener el resumen de la propiedad:', error);
    next(error);
  }
};

// controllers/application.controller.js

export const getApplicationsByProperty = async (req, res, next) => {
  try {
    const {listingId} = req.params;
    const applications = await Application.find({ listingId })
      .populate('userId', '_id name profileImage')
      .exec();

    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error('Error al obtener las solicitudes:', error);
    next(error);
  }
};









//este va a ser parte del algortimo de search y voy a contruir aqui la paginacion y demas
export const getListings = async (req, res, next) => {
  try {
    // Set defaults for pagination
    const limit = parseInt(req.query.limit) || 9;
    const startIndex = parseInt(req.query.startIndex) || 0;
    
    // Build filter conditions
    let offer = req.query.offer;
    if (offer === undefined || offer === 'false') {
      offer = { $in: [false, true] };
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

    // Get the search term from the query
    const searchTerm = req.query.searchTerm || '';
    
    // Create the query object
    const query = {
      offer,
      furnished,
      parking,
      type,
    };
    
    // If there's a search term, add it to the query
    if (searchTerm) {
      // Normalize the search term (like we do when creating listings)
      const normalizedSearchTerm = removeDiacritics(searchTerm.toLowerCase());
      
      // Search in both the original address and the normalized version
      query.$or = [
        { address: { $regex: searchTerm, $options: 'i' } }, // Original term with accents
        { normalized_address: { $regex: normalizedSearchTerm, $options: 'i' } } // Normalized term
      ];
    }
    
    // Set up sort options
    const sort = req.query.sort || 'createdAt';
    const order = req.query.order || 'desc';
    const sortOptions = { [sort]: order === 'desc' ? -1 : 1 };
    
    // Execute the search
    const listings = await Listing.find(query)
      .collation({ locale: 'es', strength: 1 }) // This helps with Spanish accent matching
      .sort(sortOptions)
      .limit(limit)
      .skip(startIndex);
      
    // Get total count for pagination
    const total = await Listing.countDocuments(query);
      
    // Return results with pagination info
    return res.status(200).json({
      success: true,
      listings,
      total,
      hasMore: startIndex + listings.length < total
    });

  } catch (error) {
    next(error);
  }
};