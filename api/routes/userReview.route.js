// routes/userReview.route.js
import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import {
    createUserReview,
    getUserReviews,
    deleteUserReview,
} from '../controllers/userReview.controller.js';

const router = express.Router();

// Crear reseña (el user debe estar loggeado)
router.post('/', verifyToken, createUserReview);

// Obtener reseñas de un user
router.get('/:userId', getUserReviews);

// Eliminar reseña (opcional)
router.delete('/:reviewId', verifyToken, deleteUserReview);

export default router;
