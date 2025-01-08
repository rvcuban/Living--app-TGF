// controllers/userReview.controller.js
import UserReview from '../models/userReview.model.js';
import { errorHandle } from '../utils/error.js';

export const createUserReview = async (req, res, next) => {
  try {
    const { targetUser, rating, comment } = req.body;
    const newReview = new UserReview({
      author: req.user.id,  // auth user
      target: targetUser,   // user a quien reseñamos
      rating,
      comment
    });
    await newReview.save();
    // ...puedes actualizar media de rating, etc. en tu usuario
    res.status(201).json({ success: true, review: newReview });
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
  // ...
};
