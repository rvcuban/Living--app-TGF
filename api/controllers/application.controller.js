// controllers/application.controller.js

import Application from '../models/application.model.js';
import Listing from '../models/listing.model.js';
import { errorHandle } from '../utils/error.js';


export const getUserApplications = async (req, res, next) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .populate('propertyId') // Popula los datos de la propiedad
      .exec();
    res.status(200).json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    next(errorHandle(500, 'Error al obtener las aplicaciones.'));
  }
};

// Crear una nueva aplicación
export const createApplication = async (req, res, next) => {
  const { propertyId } = req.body;

  if (!propertyId) {
    return next(errorHandle(400, 'propertyId es requerido.'));
  }

  try {
    // Verificar que la propiedad exista
    const property = await Listing.findById(propertyId);
    if (!property) {
      return next(errorHandle(404, 'Propiedad no encontrada.'));
    }

    // Verificar si ya existe una aplicación para esta propiedad por el mismo usuario
    const existingApplication = await Application.findOne({ userId: req.user.id, propertyId });
    if (existingApplication) {
      return next(errorHandle(400, 'Ya has aplicado a esta propiedad.'));
    }

    const newApplication = new Application({
      userId: req.user.id,
      propertyId,
      status: 'Enviada',
      history: [{ status: 'Enviada', timestamp: new Date() }],
    });

    await newApplication.save();

    res.status(201).json({ success: true, application: newApplication });
  } catch (error) {
    console.error('Error creating application:', error);
    next(errorHandle(500, 'Error al crear la aplicación.'));
  }
};

// Cancelar una aplicación específica
export const cancelApplication = async (req, res, next) => {
  const { applicationId } = req.params;

  try {
    const application = await Application.findById(applicationId);
    if (!application) {
      return next(errorHandle(404, 'Aplicación no encontrada.'));
    }

    // Verificar que la aplicación pertenece al usuario
    if (application.userId.toString() !== req.user.id) {
      return next(errorHandle(401, 'No estás autorizado para cancelar esta aplicación.'));
    }

    await application.remove();

    res.status(200).json({ success: true, message: 'Aplicación cancelada correctamente.' });
  } catch (error) {
    console.error('Error canceling application:', error);
    next(errorHandle(500, 'Error al cancelar la aplicación.'));
  }
};

// Actualizar el estado de una aplicación (opcional)
export const updateApplication = async (req, res, next) => {
  const { applicationId } = req.params;
  const { status, content } = req.body;

  if (!status) {
    return next(errorHandle(400, 'El estado es requerido.'));
  }

  // Validar que el estado está dentro de los permitidos
  const validStatuses = ['Enviada', 'Aceptada', 'Rechazada', 'Generando Contrato', 'Esperando Confirmación', 'Revisando Modificaciones', 'Confirmación Final'];
  if (!validStatuses.includes(status)) {
    return next(errorHandle(400, 'Estado inválido.'));
  }

  try {
    const application = await Application.findById(applicationId);
    if (!application) {
      return next(errorHandle(404, 'Aplicación no encontrada.'));
    }

    // Verificar que la aplicación pertenece al usuario o al propietario de la propiedad
    const property = await Listing.findById(application.propertyId);
    if (
      application.userId.toString() !== req.user.id &&
      property.userRef.toString() !== req.user.id
    ) {
      return next(errorHandle(401, 'No estás autorizado para actualizar esta aplicación.'));
    }

    // Actualizar el estado y el historial
    application.status = status;
    application.history.push({ status, timestamp: new Date() });

    if (content) {
      application.contract.content = content;
      // Incrementar la versión del contrato
      application.contract.version += 1;
    }

    await application.save();

    res.status(200).json({ success: true, application });
  } catch (error) {
    console.error('Error updating application:', error);
    next(errorHandle(500, 'Error al actualizar la aplicación.'));
  }
};