import express from "express";
import { deleteUser, getUserListings, test, updateUser ,getUser,getPublicProfile,getUsers,updateSetNewUser,setUserIsNewFalse,updateUserVideos,getUserCountsByLocation} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";
const router = express.Router();

router.get('/test',test);

router.post('/setNewUserFalse/:id', verifyToken, setUserIsNewFalse);

// Nueva ruta para buscar usuarios
router.get('/get', getUsers);

// 1) Poner aquí la ruta de perfil público
router.get('/public-profile/:userId', getPublicProfile);

router.post('/update/:id',verifyToken,updateUser);
router.delete('/delete/:id',verifyToken,deleteUser);
router.post('/update_setnewuser/:id',verifyToken,updateSetNewUser);


router.get('/listings/:id', verifyToken, getUserListings)
router.get('/:id', getUser)
// Ruta para actualizar videos del usuario
router.post('/:id/videos', verifyToken, updateUserVideos);

router.get('/count-by-location', getUserCountsByLocation);




export default router; 