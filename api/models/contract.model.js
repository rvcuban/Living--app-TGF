import mongoose from 'mongoose';

const ContractSchema = new mongoose.Schema({
    propiedad: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    propietario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    inquilinos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    documentoContrato: { type: String, required: true }, // URL al documento almacenado
    estado: {
      type: String,
      enum: ['pendiente', 'modificado', 'aceptado', 'rechazado'],
      default: 'pendiente',
    },
    historialModificaciones: [{ type: String }], // URLs a versiones anteriores
    fechaCreacion: { type: Date, default: Date.now },
    ultimaActualizacion: { type: Date, default: Date.now },
  });
  
  const Contract = mongoose.model('Contract', ContractSchema);
  export default Contract;