// controllers/requestController.js

import Request from '../models/Request.model.js';
import Listing from '../models/listing.model.js';
import { errorHandle } from '../utils/error.js';

// Crear una nueva solicitud
export const createRequest = async (req, res, next) => {
  try {
    const { userRef, listingRef } = req.body;

    // Verificar que la propiedad existe
    const listing = await Listing.findById(listingRef);
    if (!listing) return next(errorHandle(404, 'Listing not found'));

    // Crear la solicitud
    const newRequest = await Request.create({ userRef, listingRef });
    res.status(201).json(newRequest);
  } catch (error) {
    next(error);
  }
};

// Actualizar el estado de la solicitud
export const updateRequestStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status, modifications, contractUrl } = req.body;

  try {
    const request = await Request.findById(id);
    if (!request) return next(errorHandle(404, 'Request not found'));

    // Actualizar el estado y las propiedades relevantes
    request.status = status;
    if (modifications) request.modifications = modifications;
    if (contractUrl) request.contractUrl = contractUrl;

    await request.save();
    res.status(200).json(request);
  } catch (error) {
    next(error);
  }
};

// Obtener todas las solicitudes para un usuario
export const getUserRequests = async (req, res, next) => {
  const { userId } = req.params;

  try {
    const requests = await Request.find({ userRef: userId }).populate('listingRef');
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

// Obtener todas las solicitudes para una propiedad (para el dueño)
export const getListingRequests = async (req, res, next) => {
  const { listingId } = req.params;

  try {
    const requests = await Request.find({ listingRef: listingId }).populate('userRef');
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

// Confirmar el contrato y finalizar el proceso
export const finalizeRequest = async (req, res, next) => {
  const { id } = req.params;

  try {
    const request = await Request.findById(id);
    if (!request) return next(errorHandle(404, 'Request not found'));

    // Si el contrato está confirmado, agregar el usuario como residente
    if (request.status === 'contract_accepted') {
      await Listing.findByIdAndUpdate(request.listingRef, {
        $push: { residents: request.userRef },
      });
      request.status = 'completed';
      await request.save();
      res.status(200).json({ message: 'Request finalized and user added as resident' });
    } else {
      next(errorHandle(400, 'Contract must be accepted to finalize request'));
    }
  } catch (error) {
    next(error);
  }
};
