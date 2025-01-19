// controllers/userReview.controller.js
import UserReview from '../models/userReview.model.js';
import { updateUserRating } from '../utils/reviewUtil.js';
import { errorHandle } from '../utils/error.js';
import User from '../models/user.model.js';

export const createUserReview = async (req, res, next) => {
  try {
    console.log("Request Body =>", req.body);
    const { targetUser, rating, comment } = req.body;
    const authorId = req.user.id;
    

    console.log("targetUser =>", targetUser); 
    // Verificar que el autor no está reseñando a sí mismo
    if (authorId === targetUser) {
      return res.status(400).json({ success: false, message: 'No puedes reseñar a ti mismo.' });
    }
    console.log("todo correcto1")

    const newReview = new UserReview({
      author: req.user.id,  // auth user
      target: targetUser,   // user a quien reseñamos
      rating,
      comment
    });
    console.log("todo correcto2")
    await newReview.save();
    // ...actualizar media de rating, etc. en tu usuario
    console.log("todo correcto3")


    console.log("antes de updateUserRating");
    try {
      await updateUserRating(targetUser);
      console.log("después de updateUserRating");
    } catch (error) {
      console.error("Falla en updateUserRating:", error);
      return res.status(500).json({ success: false, message: 'Error al actualizar rating' });
    }

    const updatedUser = await User.findById(targetUser);
    if (!updatedUser) {
      // Lanza un 404 o maneja el error
      return res.status(404).json({
        success: false,
        message: "El usuario reseñado no existe en la base de datos"
      });
    }


    console.log("todo correcto4")
    return res.status(201).json({
      success: true,
      review: newReview,
      averageRating: updatedUser.averageRating,
      reviewsCount: updatedUser.reviewsCount,
      message: 'Reseña creada correctamente.'
    });
  } catch (err) {
    next(err);
  }
};

export const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const reviews = await UserReview.find({ target: userId })
      .populate('author', 'username avatar');
    res.status(200).json({
      success: true,
      reviews,
      message: reviews.length ? '' : 'No hay reseñas para este usuario'
    });
  } catch (err) {
    next(err);
  }
};

export const deleteUserReview = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const authorId = req.user.id;

    const review = await UserReview.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Reseña no encontrada.' });
    }

    // Solo el autor puede eliminar su reseña
    if (review.author.toString() !== authorId) {
      return res.status(403).json({ success: false, message: 'No autorizado para eliminar esta reseña.' });
    }

    const targetUserId = review.targetUser;

    await review.remove();

    // Actualizar averageRating y reviewsCount
    await updateUserRating(targetUserId);

    // Obtener los valores actualizados
    const updatedUser = await User.findById(targetUserId);

    return res.status(200).json({
      success: true,
      message: 'Reseña eliminada correctamente.',
      averageRating: updatedUser.averageRating,
      reviewsCount: updatedUser.reviewsCount
    });
  } catch (err) {
    console.error('Error en deleteUserReview:', err);
    next(errorHandle(500, 'Error al eliminar la reseña.'));
  }
};
