import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    listingRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: true,
    },
    userRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5, // Valoración de 1 a 5 estrellas
    },
    comment: {
      type: String,
      required: true,
    },
    
    
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);

export default Review;