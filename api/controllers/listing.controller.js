import Listing from '../models/listing.model.js';
import { errorHandle } from '../utils/error.js';
import mongoose from 'mongoose';

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