import mongoose from "mongoose";
import { removeDiacritics } from "../utils/removeDiacritics.js";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,

  },
  phone: { type: String },
  dateOfBirth: { type: Date },
  address: { type: String },
  gender: { type: String, enum: ['masculino', 'femenino', 'otro'] },
  documentos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
  favoritos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  rol: { type: String, enum: ['Estudiante', 'Trabajador', 'Viajero', 'Sin Rol'], default: 'Sin Rol' },
  badges: { type: [String], default: ['Perfil nuevo'] }, // e.g., ["Superhost", "Verified"]
  verified: { type: Boolean, default: false },
  reliability: { type: String, default: 'Estándar' }, // e.g., "Alta", "Estándar"
  averageRating: { type: Number, default: 0 },

  numeroIdentificacion: {
    type: String,
    unique: true // Asumiendo que cada identificación es única
  },
  tipoIdentificacion: {
    type: String,
    enum: ['DNI', 'Pasaporte', 'NIE'],
  },

  favoritos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property'
  }],



  avatar: {
    type: String,
    default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
  },

  lookingForRoommate: { type: Boolean, default: false },
  // indica si busca compañeros de piso

  // Preferencias de convivencia
  preferences: {
    pets: { type: Boolean, default: false },          // ¿Acepta mascotas?
    smoker: { type: Boolean, default: false },        // ¿Fumador?
    schedule: { type: String },                      // ej. "Soy diurno", "Tengo un horario flexible", etc.
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  ],
  averageRating: { type: Number, default: 0 }, // Nuevo campo
  reviewsCount: { type: Number, default: 0 },  // Nuevo campo
  location: { // Nuevo campo: Ubicación para mostrar la ubicacion donde esta bsucando compañeros
    type: String,
  },
  locationNoAccent: { type: String },
  isNewUser: {
    type: Boolean,
    default: true  // Al crear, la cuenta es "nueva"
  },
  // NUEVOS CAMPOS PARA CONTENIDO DINÁMICO EN EL PERFIL
  shortBio: { type: String, default: '' },
  interests: { type: [String], default: [] },
  gallery: { type: [String], default: [] },
  videos: { type: [String], default: [] }, // <-- Nuevo campo para videos

}, { timestamps: true }
);

userSchema.pre('save', function (next) {
  if (this.location) {
    this.locationNoAccent = removeDiacritics(this.location.toLowerCase());
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;  