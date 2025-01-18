
import express from 'express';
import { verifyToken } from '../utils/verifyUser.js'; // Si requieres autenticación
import {
  createBuddyRequest,
  acceptBuddyRequest,
  rejectBuddyRequest,
  getMyBuddyRequests,
  getRoommateStatus
} from '../controllers/roomMate.controller.js';

const router = express.Router();

// Crear una solicitud de compañero
router.post('/', verifyToken, createBuddyRequest);

// Aceptar una solicitud
router.post('/accept/:requestId', verifyToken, acceptBuddyRequest);

// Rechazar una solicitud
router.post('/reject/:requestId', verifyToken, rejectBuddyRequest);

// Listar solicitudes (ejemplo: las que he recibido)
router.get('/my-requests', verifyToken, getMyBuddyRequests);

// NUEVO ENDPOINT: Obtener estado de compañerismo (none/pending/accepted)
router.get('/status/:otherUserId', verifyToken, getRoommateStatus);

export default router;
