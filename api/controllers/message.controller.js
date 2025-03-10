// controllers/message.controller.js
import mongoose from 'mongoose';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';
import { errorHandle } from '../utils/error.js';

/**
 * Genera un ID único de conversación basado en dos IDs.
 * Convierte los IDs a string, los ordena alfabéticamente y los une con un guion bajo.
 */
const generateConversationId = (id1, id2) => {
  return [id1.toString(), id2.toString()].sort().join('_');
};

/**
 * getConversations
 * Devuelve la lista de conversaciones del usuario autenticado y además calcula
 * la cantidad de mensajes no leídos (usando la propiedad "read" en cada mensaje).
 */
/**
 * getConversations
 * Devuelve la lista de conversaciones del usuario autenticado y además calcula
 * la cantidad de mensajes no leídos (usando la propiedad "read" en cada mensaje).
 */
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    

    // First, find all conversations where the user is involved
    const messages = await Message.aggregate([
      // Find messages that include this user's ID in the conversationId
      { 
        $match: { 
          conversationId: { $regex: userId } 
        } 
      },
      // Sort by date descending (newest first)
      { $sort: { createdAt: -1 } },
      // Group by conversationId to get the last message
      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$content" },
          lastMessageDate: { $first: "$createdAt" },
          lastMessageSender: { $first: "$user" }
        }
      }
    ]);
    
    // For each conversation, get the partner info and unread count
    const conversationsWithDetails = await Promise.all(
      messages.map(async (conv) => {
        // Extract partner ID from conversation ID
        const ids = conv._id.split('_');
        const partnerId = ids.find(id => id !== String(userId));
        
        // Get partner info
        let partner = null;
        try {
          const partnerInfo = await User.findById(partnerId).select('username avatar');
          if (partnerInfo) {
            partner = {
              _id: partnerInfo._id,
              username: partnerInfo.username,
              avatar: partnerInfo.avatar
            };
          }
        } catch (err) {
          console.error(`Error fetching partner info for ${partnerId}:`, err);
        }
        
        // Count unread messages
        const unreadCount = await Message.countDocuments({
          conversationId: conv._id,
          user: { $ne: userId },
          read: false
        });
        
        return {
          _id: conv._id,
          lastMessage: conv.lastMessage,
          lastMessageDate: conv.lastMessageDate,
          partner,
          unreadCount
        };
      })
    );
    
    return res.status(200).json({
      success: true,
      conversations: conversationsWithDetails
    });
  } catch (error) {
    console.error('Error getting conversations:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener conversaciones'
    });
  }
};

/**
 * startConversation
 * Inicia (o reanuda) una conversación entre el usuario autenticado y otro receptor.
 * Se espera en req.body:
 *   - receiverId: ID del usuario receptor.
 *   - content (opcional): mensaje inicial.
 */
export const startConversation = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    if (!receiverId) {
      return next(errorHandle(400, 'El ID del receptor es requerido.'));
    }
    if (senderId === receiverId) {
      return next(errorHandle(400, 'No puedes iniciar una conversación contigo mismo.'));
    }

    const conversationId = generateConversationId(senderId, receiverId);

    // Si ya existe un mensaje con este conversationId, la conversación ya existe
    const existingMsg = await Message.findOne({ conversationId });
    if (existingMsg) {
      return res.status(200).json({
        success: true,
        conversationId,
        messageText: 'Conversación ya existente.'
      });
    }

    // Crear mensaje inicial (puede estar vacío)
    const newMessage = await Message.create({
      content: content && content.trim() ? content.trim() : '',
      user: senderId,
      conversationId,
      read: false,
    });

    return res.status(201).json({
      success: true,
      conversationId,
      message: newMessage,
      messageText: 'Conversación iniciada correctamente.'
    });
  } catch (error) {
    console.error('Error al iniciar la conversación:', error);
    return next(errorHandle(500, 'Error al iniciar la conversación.'));
  }
};

/**
 * getMessages
 * Retorna los mensajes de una conversación específica, ordenados cronológicamente
 * y poblados con la información del usuario remitente.
 */
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    console.log(`Fetching messages for conversation: ${conversationId}`);
    
    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .populate('user', 'username avatar');
    
    console.log(`Found ${messages.length} messages`);
    
    return res.status(200).json({
      success: true,
      messages
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Error al obtener mensajes'
    });
  }
};


// Add this new function for socket operations
export const saveMessageFromSocket = async (messageData) => {
  try {
    // Validate required fields
    if (!messageData.content) {
      throw new Error('Message content is required');
    }
    
    if (!messageData.user) {
      throw new Error('User ID is required');
    }
    
    if (!messageData.conversationId) {
      throw new Error('Conversation ID is required');
    }
    
    // Ensure user is a valid ObjectId if it's a string
    const userId = typeof messageData.user === 'string' && mongoose.Types.ObjectId.isValid(messageData.user) 
      ? new mongoose.Types.ObjectId(messageData.user) 
      : messageData.user;
    
    // Create the message
    const newMessage = await Message.create({
      content: messageData.content,
      user: userId,
      conversationId: messageData.conversationId
    });
    
    return newMessage;
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
};

// Add REST API endpoint controller
export const saveMessage = async (req, res, next) => {
  try {
    const { content, conversationId } = req.body;
    
    if (!content || !conversationId) {
      return res.status(400).json({
        success: false,
        message: 'Content and conversationId are required'
      });
    }
    
    const newMessage = await Message.create({
      content,
      user: req.user.id,
      conversationId
    });
    
    return res.status(201).json({
      success: true,
      message: newMessage
    });
  } catch (error) {
    next(error);
  }
};

export const markMessagesAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;
    
    // Actualizar todos los mensajes en esta conversación donde el usuario no es el remitente
    const result = await Message.updateMany(
      { 
        conversationId,
        user: { $ne: userId }, // Mensajes no enviados por el usuario actual
        read: false // Solo mensajes no leídos
      },
      { read: true }
    );
    
    console.log(`Marked ${result.modifiedCount} messages as read in conversation ${conversationId}`);
    
    return res.status(200).json({
      success: true,
      modifiedCount: result.modifiedCount,
      message: 'Mensajes marcados como leídos'
    });
  } catch (error) {
    console.error('Error al marcar mensajes como leídos:', error);
    return next(errorHandle(500, 'Error al marcar mensajes como leídos'));
  }
};