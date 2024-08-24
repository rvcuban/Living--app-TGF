import Listing from '../models/listing.model.js';
import { errorHandle } from '../utils/error.js';


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