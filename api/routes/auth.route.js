import express from 'express';
import { google, signin, signOut, signup ,signupAutoLogin,googleCallback} from '../controllers/auth.controller.js';

const router = express.Router();

router.post("/signup",signup);
router.post("/signin",signin);
router.post("/google",google);
router.get("/signout",signOut);
router.post("/signupAutoLogin", signupAutoLogin);

router.get("/google/callback", googleCallback);

export default router;