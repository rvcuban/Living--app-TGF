import express from "express";
import { createListing, deleteListing } from "../controllers/listing.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();


//verificamos si esta autentificado y despues le dejamos crear el listing 
router.post('/create', verifyToken, createListing);
router.delete('/delete/:id', verifyToken, deleteListing);

export default router;