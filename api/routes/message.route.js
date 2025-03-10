// routes/message.routes.js
import express from 'express';
import { getConversations,getMessages,startConversation,saveMessage,markMessagesAsRead} from '../controllers/message.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/conversations', verifyToken, getConversations);

// Obtener mensajes de una conversación específica
router.get('/messages/:conversationId', verifyToken, getMessages);

// Iniciar o reanudar una conversación
router.post('/start', verifyToken, startConversation);
// Guardar un mensaje manualmente (REST API)
router.post('/messages', verifyToken, saveMessage);

//Marcar mensajes como leídos
router.post('/read/:conversationId', verifyToken, markMessagesAsRead);


export default router;