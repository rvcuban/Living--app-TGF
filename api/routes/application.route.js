import express from 'express';
import {
  createApplication,
  updateApplication,
  getUserApplications,
  cancelApplication,
  getApplicationsByProperty,
  acceptApplication,
  rejectApplication,
} from '../controllers/application.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();
// Rutas para aplicaciones
router.get('/listing/:listingId', verifyToken, getApplicationsByProperty);
router.get('/', verifyToken, getUserApplications); // Obtener todas las aplicaciones del usuario


router.post('/', verifyToken, createApplication); // Crear una nueva aplicación
// application.routes.js
router.delete('/:applicationId', verifyToken, cancelApplication);
router.put('/:applicationId', verifyToken, updateApplication);
// Actualizar el estado de una aplicación

// Aceptar una solicitud
router.post('/:applicationId/accept', verifyToken, acceptApplication);

// Rechazar una solicitud
router.post('/:applicationId/reject', verifyToken, rejectApplication);

export default router;
