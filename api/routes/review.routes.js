import express from "express";
import { createReview, getListingReviews, deleteReview } from '../controllers/review.controller.js';
import { verifyToken } from "../utils/verifyUser.js";


const router = express.Router();


router.post('/createReview', verifyToken, createReview);
router.get('/:listingId', getListingReviews);
router.delete('/deleteReview/:id/', verifyToken, deleteReview);

export default router;