
import RoomMate from '../models/roomMate.model.js';
import User from '../models/user.model.js';

// Crear una solicitud de compañero
export const createBuddyRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderId = req.user.id; // Asumiendo que verifyToken inyecta user.id

    if (!receiverId) {
      return res.status(400).json({ success: false, message: 'Falta receiverId' });
    }

    // Verificar que no haya una solicitud previa pendiente
    const existingRequest = await RoomMate.findOne({
      sender: senderId,
      receiver: receiverId,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'Ya enviaste una solicitud pendiente a este usuario.'
      });
    }

    // Crear la solicitud
    const buddyRequest = await RoomMate.create({
      sender: senderId,
      receiver: receiverId
    });

    return res.json({
      success: true,
      data: buddyRequest,
      message: 'Solicitud enviada correctamente'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error en createBuddyRequest' });
  }
};

// Aceptar
export const acceptBuddyRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id; // user que está logueado

    // Buscar la solicitud
    const request = await RoomMate.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    // Solo el receiver puede aceptar
    if (request.receiver.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'No autorizado.' });
    }

    request.status = 'accepted';
    await request.save();

    // Aquí podrías crear la lógica para “crear chat”
    // Por ejemplo, Chat.create({ members: [request.sender, request.receiver], ... })

    return res.json({
      success: true,
      data: request,
      message: 'Solicitud aceptada'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error en acceptBuddyRequest' });
  }
};

// Rechazar
export const rejectBuddyRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = await RoomMate.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Solicitud no encontrada' });
    }

    // Solo el receiver puede rechazar
    if (request.receiver.toString() !== userId) {
      return res.status(403).json({ success: false, message: 'No autorizado.' });
    }

    request.status = 'rejected';
    await request.save();

    return res.json({
      success: true,
      data: request,
      message: 'Solicitud rechazada'
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error en rejectBuddyRequest' });
  }
};

// Listar solicitudes para el usuario logueado
export const getMyBuddyRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    // Podrías filtrar las recibidas o enviadas, aquí un ejemplo de “recibidas”
    const requests = await RoomMate.find({ receiver: userId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error en getMyBuddyRequests' });
  }
};


export const getRoommateStatus = async (req, res) => {
  try {
    const userId = req.user.id; // Usuario que hace la consulta
    const { otherUserId } = req.params;

    // Si ambos IDs son iguales, retornamos 'self' o algo similar
    if (userId === otherUserId) {
      return res.json({
        success: true,
        status: 'self',
        message: 'No se puede tener una solicitud contigo mismo'
      });
    }

    // Buscar solicitudes donde participen userId y otherUserId
    // Basta con buscar si sender es userId y receiver es otherUserId (o viceversa),
    // Y su status sea pending o accepted
    const request = await RoomMate.findOne({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ],
      status: { $in: ['pending', 'accepted'] }
    });

    if (!request) {
      // No existe relación -> 'none'
      return res.json({
        success: true,
        status: 'none',
        message: 'No existe solicitud'
      });
    }

    // Si existe la solicitud, revisamos su estado
    return res.json({
      success: true,
      status: request.status, // 'pending' o 'accepted'
      message: `Solicitud en estado ${request.status}`
    });

  } catch (error) {
    console.error('Error en getRoommateStatus:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener estado de compañerismo'
    });
  }
};