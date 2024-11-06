import mongoose from 'mongoose';


const ApplicationSchema = new mongoose.Schema({
    propiedad: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    inquilino: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    estado: {
      type: String,
      enum: ['enviada', 'aceptada', 'rechazada', 'contratoGenerado', 'esperandoConfirmacion', 'finalizada'],
      default: 'enviada',
    },
    mensaje: { type: String },
    fechaCreacion: { type: Date, default: Date.now },
    ultimaActualizacion: { type: Date, default: Date.now },
  });
  
  const Application = mongoose.model('Application', ApplicationSchema);
  export default Application;
  