import express from "express";
import { createListing, deleteListing ,updateListing, getListing, getListings} from "../controllers/listing.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();


//verificamos si esta autentificado y despues le dejamos crear el listing 
router.post('/create', verifyToken, createListing);
router.delete('/delete/:id', verifyToken, deleteListing);
router.post('/update/:id', verifyToken, updateListing);
router.get('/get/:id', getListing);

router.get('/get', getListings);

export default router;