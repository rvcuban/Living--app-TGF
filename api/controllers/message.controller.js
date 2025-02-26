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
 * Devuelve la lista de conversaciones del usuario autenticado.
 */
export const getConversations = async (req, res, next) => {
  try {
    // Usamos req.user.id (ya que verifyToken establece la propiedad 'id')
    const userId = req.user.id;

    // Buscar todos los mensajes en los que el usuario participe.
    const messages = await Message.find({
      $or: [
        { user: userId },
        { conversationId: { $regex: userId } } // El conversationId contiene ambos IDs ordenados.
      ]
    }).lean();

    // Extraer los IDs de conversación (IDs compuestos) y determinar el "otro" usuario.
    const conversationMap = new Map();
    messages.forEach((msg) => {
      const ids = msg.conversationId.split('_');
      // Determinar el partnerId comparando con el userId actual.
      const partnerId = ids[0] === userId ? ids[1] : ids[0];
      if (!conversationMap.has(partnerId)) {
        conversationMap.set(partnerId, { conversationId: msg.conversationId, partnerId });
      }
    });

    // Convertir los IDs de los partners a un arreglo
    const partnerIds = Array.from(conversationMap.keys());

    // Buscar la información de los usuarios (partners)
    const partners = await User.find({ _id: { $in: partnerIds } })
      .select('username avatar')
      .lean();

    // Formatear la respuesta con la información necesaria
    const conversations = partners.map((partner) => ({
      conversationId: generateConversationId(userId, partner._id),
      userId: partner._id.toString(),
      username: partner.username,
      avatar: partner.avatar,
    }));

    return res.json({ success: true, conversations });
  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    return next(errorHandle(500, 'Error al obtener conversaciones'));
  }
};

/**
 * startConversation
 * Inicia o reanuda una conversación entre el usuario autenticado y otro receptor.
 * Se espera recibir en req.body:
 *  - receiverId: el ID del usuario receptor.
 *  - content (opcional): mensaje inicial.
 */
export const startConversation = async (req, res, next) => {
  try {
    // Usamos req.user.id en lugar de req.user._id
    const senderId = req.user.id;
    const { receiverId, content } = req.body;

    if (!receiverId) {
      return next(errorHandle(400, 'El ID del receptor es requerido.'));
    }
    if (senderId === receiverId) {
      return next(errorHandle(400, 'No puedes iniciar una conversación contigo mismo.'));
    }

    // Generar el conversationId único
    const conversationId = generateConversationId(senderId, receiverId);

    // Verificar si ya existe algún mensaje con este conversationId
    const existingMsg = await Message.findOne({ conversationId });
    if (existingMsg) {
      return res.status(200).json({
        success: true,
        conversationId,
        messageText: 'Conversación ya existente.'
      });
    }

    // Crear un mensaje inicial (puede ser vacío o con contenido prellenado)
    const newMessage = await Message.create({
      content: content && content.trim() ? content.trim() : '',
      user: senderId,
      conversationId,
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
 * Retorna los mensajes de una conversación específica.
 */
export const getMessages = async (req, res, next) => {
  try {
    const { conversationId } = req.params;

    const messages = await Message.find({ conversationId })
      .populate('user', 'username avatar')
      .sort({ createdAt: 1 })
      .lean();

    return res.json({ success: true, messages });
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    return next(errorHandle(500, 'Error al obtener mensajes'));
  }
};
