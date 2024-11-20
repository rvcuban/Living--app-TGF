
import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    status: {
        type: String,
        enum: ['Enviada', 'Aceptada', 'Rechazada', 'Generando Contrato', 'Esperando Confirmación', 'Revisando Modificaciones', 'Confirmación Final'],
        default: 'Enviada'
    },
    contract: {
        version: { type: Number, default: 1 },
        content: String, // Aquí se guardaría el contenido del contrato
        acceptedByUser: { type: Boolean, default: false },
        acceptedByOwner: { type: Boolean, default: false }
    },
    history: [{
        status: String,
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

export default mongoose.model('Request', requestSchema);
