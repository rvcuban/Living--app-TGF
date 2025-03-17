
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

// NEW: Get sent roommate requests
export const getSentRoommateRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const sentRequests = await RoomMate.find({ sender: userId })
      .populate('receiver', 'username avatar')
      .populate({
        path: 'receiver',
        select: 'username avatar'
      })
      .sort({ createdAt: -1 });
    
    return res.json({
      success: true,
      applications: sentRequests.map(req => ({
        _id: req._id,
        status: req.status,
        createdAt: req.createdAt,
        // Format to match your applications structure
        applicantId: {
          _id: req.sender,
          username: req.sender.username,
          avatar: req.sender.avatar
        },
        listingId: {
          owner: req.receiver
        }
      }))
    });
  } catch (error) {
    console.error('Error getting sent roommate requests:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener solicitudes enviadas' });
  }
};

// NEW: Get received roommate requests
export const getReceivedRoommateRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const receivedRequests = await RoomMate.find({ receiver: userId })
      .populate('sender', 'username avatar')
      .sort({ createdAt: -1 });
    
    return res.json({
      success: true,
      applications: receivedRequests.map(req => ({
        _id: req._id,
        status: req.status,
        createdAt: req.createdAt,
        // Format to match your applications structure
        applicantId: {
          _id: req.sender._id,
          username: req.sender.username,
          avatar: req.sender.avatar
        },
        // Add any other fields your frontend expects
        type: 'roommate'
      }))
    });
  } catch (error) {
    console.error('Error getting received roommate requests:', error);
    return res.status(500).json({ success: false, message: 'Error al obtener solicitudes recibidas' });
  }
};

//Get my buddies (accepted requests)
export const getMyBuddies = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Find all accepted buddy requests where I'm either sender or receiver
    const buddiesAsSender = await RoomMate.find({
      sender: userId,
      status: 'accepted'
    }).populate('receiver', 'username avatar _id');

    const buddiesAsReceiver = await RoomMate.find({
      receiver: userId,
      status: 'accepted'
    }).populate('sender', 'username avatar _id');

    // Format the data to have consistent structure
    const formattedBuddies = [
      ...buddiesAsSender.map(buddy => ({
        _id: buddy._id,
        createdAt: buddy.createdAt,
        user: buddy.receiver
      })),
      ...buddiesAsReceiver.map(buddy => ({
        _id: buddy._id,
        createdAt: buddy.createdAt,
        user: buddy.sender
      }))
    ];

    return res.json({
      success: true,
      buddies: formattedBuddies
    });
  } catch (error) {
    console.error('Error getting buddies:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener tus compañeros'
    });
  }
};

// Remove a buddy
export const removeBuddy = async (req, res) => {
  try {
    const userId = req.user.id;
    const { buddyId } = req.params;

    const buddyRequest = await RoomMate.findById(buddyId);
    
    if (!buddyRequest) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud de compañero no encontrada'
      });
    }
    
    // Check if user is part of this buddy relationship
    if (buddyRequest.sender.toString() !== userId && 
        buddyRequest.receiver.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar esta relación de compañeros'
      });
    }
    
    // Delete the buddy request
    await RoomMate.findByIdAndDelete(buddyId);
    
    return res.json({
      success: true,
      message: 'Compañero eliminado correctamente'
    });
  } catch (error) {
    console.error('Error removing buddy:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al eliminar compañero'
    });
  }
};