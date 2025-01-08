
import mongoose from 'mongoose';

const userReviewSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Quien escribe
  target: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // A quien se reseña
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true },
}, { timestamps: true });

export default mongoose.model('UserReview', userReviewSchema);
