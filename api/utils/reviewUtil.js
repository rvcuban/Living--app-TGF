import User from '../models/user.model.js';
import UserReview from '../models/userReview.model.js';

/**
 * Calcula y actualiza el averageRating y reviewsCount de un usuario.
 * @param {String} userId - ID del usuario a actualizar.
 */
export const updateUserRating = async (userId) => {
    try {
      // Buscar con "target" 
      const reviews = await UserReview.find({ target: userId });
      const reviewsCount = reviews.length;
      const averageRating = reviewsCount > 0
        ? reviews.reduce((acc, review) => acc + review.rating, 0) / reviewsCount
        : 0;
  
      await User.findByIdAndUpdate(userId, { averageRating, reviewsCount });
    } catch (error) {
      console.error('Error actualizando rating del usuario:', error);
      throw error;
    }
  };
  