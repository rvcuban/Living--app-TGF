import express from 'express';
import {
  createRequest,
  updateRequestStatus,
  getUserRequests,
  getListingRequests,
  finalizeRequest,
} from '../controllers/request.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

// Crear una nueva solicitud
router.post('/', verifyToken, createRequest);

// Actualizar el estado de la solicitud
router.put('/:id/status', verifyToken, updateRequestStatus);

// Obtener todas las solicitudes de un usuario
router.get('/user/:userId', verifyToken, getUserRequests);

// Obtener todas las solicitudes de una propiedad
router.get('/listing/:listingId', verifyToken, getListingRequests);

// Finalizar la solicitud (si el contrato es aceptado)
router.put('/:id/finalize', verifyToken, finalizeRequest);

export default router;
