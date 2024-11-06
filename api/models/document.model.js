import mongoose from 'mongoose';
const DocumentSchema = new mongoose.Schema({
    usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tipoDocumento: { type: String, enum: ['DNI', 'Pasaporte', 'Otro'], required: true },
    urlArchivo: { type: String, required: true },
    fechaSubida: { type: Date, default: Date.now },
  });
  
  const Document = mongoose.model('Document', DocumentSchema);
  export default Document;
  