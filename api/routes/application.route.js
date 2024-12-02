import express from 'express';
import {
  createApplication,
  updateApplication,
  getUserApplications,
  cancelApplication,
  getApplicationsByProperty,
  acceptApplication,
  rejectApplication,
  uploadContract,
  sendContractToTenant,
  generateContract,
  
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


// Nueva ruta para subir el contrato
router.post('/:applicationId/upload-contract', verifyToken, uploadContract);

// Nueva ruta para enviar el contrato al inquilino
router.post('/:applicationId/send-contract', verifyToken, sendContractToTenant);
router.post('/:applicationId/generate-contract', verifyToken, generateContract);

// Cancelar (eliminar) una solicitud
router.delete('/:applicationId/cancel',verifyToken, cancelApplication);

export default router;
