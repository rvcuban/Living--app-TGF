import { errorHandle } from "../utils/error.js";
import User from '../models/user.model.js';
import Listing from "../models/listing.model.js";
import Review from "../models/review.model.js";

export const createReview = async (req, res, next) => {
  const { rating, comment, listingId } = req.body;

  try {
    // Crear la nueva reseña
    const newReview = new Review({
      userRef: req.user.id,
      listingRef: listingId,
      rating,
      comment
    });

    const savedReview = await newReview.save();

    // Actualizar el listado con la nueva reseña
    const listing = await Listing.findById(listingId); //obtenemos el id del listing

    if (!listing) return next(errorHandle(404, 'Listing not found')); // si no devolvemos error

    listing.reviews.push(savedReview._id);

    if (!listing.reviews) {
      listing.reviews = []; //si no havbia reviews las iniciamos a vacio
    }

    // Calcular la nueva media de rating
    listing.averageRating = (
      (listing.averageRating * listing.reviewCount + rating) /
      (listing.reviewCount + 1)
    ).toFixed(1);

    listing.reviewCount += 1;
    await listing.save();

    res.status(201).json(savedReview);
  } catch (error) {
    next(error);
  }
};



// obtener reseña
export const getListingReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ listing: req.params.listingId }).populate('user', 'username avatar');

    if (reviews.length === 0) {
      return res.status(200).json({ message: 'No reviews yet.' });
    }

    res.status(200).json(reviews);
  } catch (error) {
    next(error);
  }
};

//eliminhar una review 
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) return next(errorHandle(404, 'Review not found'));

    if (review.user.toString() !== req.user.id) {
      return next(errorHandle(401, 'You can only delete your own review'));
    }

    await Review.findByIdAndDelete(req.params.id);

    const listing = await Listing.findById(review.listing);

    // Actualizar el listado
    listing.reviews = listing.reviews.filter(r => r.toString() !== req.params.id);
    listing.reviewCount -= 1;

    if (listing.reviewCount === 0) {
      listing.averageRating = 0;
    } else {
      const totalRating = await Review.aggregate([
        { $match: { listing: listing._id } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]);

      listing.averageRating = totalRating[0].avgRating.toFixed(1);
    }

    await listing.save();

    res.status(200).json({ message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};
