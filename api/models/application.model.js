import mongoose from 'mongoose';


const ApplicationSchema = new mongoose.Schema({
  
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true }, // Asegurarse de que 'Listing' es el modelo correcto
  status: {
    type: String,
    enum: ['Enviada', 'Aceptada', 'Rechazada', 'Generando Contrato', 'Esperando Confirmación', 'Revisando Modificaciones', 'Confirmación Final'],
    default: 'Enviada'
  },
  contract: {
    version: { type: Number, default: 1 },
    content: String, // Aquí se guardaría el contenido del contrato
    acceptedByUser: { type: Boolean, default: false },
    acceptedByOwner: { type: Boolean, default: false },
    fileName: {type: String},
    generatedAt: { 
      type: Date 
    },
    uploadedAt: { 
      type: Date 
    }
  },
  contractGenerated: { type: Boolean, default: false },
  contractUploaded: { type: Boolean, default: false },
  contractUrl: { type: String, default: '' },
  history: [{
    status: String,
    timestamp: { type: Date, default: Date.now }
  }],



  startDate: { type: Date, default: Date.now },   // Fecha efectiva (lo forzamos a la fecha actual si no se envía)
  lugarFirma: { type: String, default: 'atravez de DCT' },

  // Duración inicial en meses (p.ej. 3,6,9,12)
  rentalDurationMonths: { type: Number, default: 12 },

  // Renta y forma de pago
  monthlyRent: { type: Number},  // Ajusta el default a tus necesidades o quítalo
  paymentMethod: { 
    type: String, 
    enum: ['TRANSFERENCIA', 'DOMICILIACION'], 
    default: 'TRANSFERENCIA' 
  },
  bankAccountOwner: { type: String },  // IBAN del propietario (opción 1)
  bankAccountTenant: { type: String }, // IBAN del inquilino (opción 2)

  // Fianza
  fianzaCantidad: { type: Number, default: 0 },
  fianzaMeses: { type: Number, default: 1 },  // p.ej. 1 mes de fianza
  guaranteeType: { 
    type: String, 
    enum: ['DEPOSITO', 'AVAL_BANCARIO', 'NINGUNA'], 
    default: 'NINGUNA' 
  },
}, { timestamps: true });

const Application = mongoose.model('Application', ApplicationSchema);
export default Application;
