// models/message.model.js
import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Referencia al modelo User
    required: true,
  },
  conversationId: {
    type: String, // o podrías usar ObjectId si creas un modelo "Conversation"
    required: true,
  },
  read: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

export default mongoose.model('Message', MessageSchema);
