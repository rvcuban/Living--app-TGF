import express from 'express';
import {
  createApplication,
  updateApplication,
  getUserApplications,
  cancelApplication,
} from '../controllers/application.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();
// Rutas para aplicaciones
router.get('/', verifyToken, getUserApplications); // Obtener todas las aplicaciones del usuario
router.post('/', verifyToken, createApplication); // Crear una nueva aplicación
router.delete('/applications/:applicationId', verifyToken, cancelApplication); // Cancelar una aplicación específica
router.put('/applications/:applicationId', verifyToken, updateApplication); // Actualizar el estado de una aplicación

export default router;
