import express from "express";
import { deleteUser, getUserListings, test, updateUser ,getUser,getPublicProfile} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
const router = express.Router();

router.get('/test',test);
// 1) Poner aquí la ruta de perfil público
router.get('/public-profile/:userId', getPublicProfile);
router.post('/update/:id',verifyToken,updateUser);
router.delete('/delete/:id',verifyToken,deleteUser);



router.get('/listings/:id', verifyToken, getUserListings)
router.get('/:id', verifyToken, getUser)

export default router; 