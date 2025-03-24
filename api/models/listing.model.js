import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    normalized_address: {
      type: String,
      required: true,
    },
    addressNoAccent: {
      type: String,
    },
    regularPrice: {
      type: Number,
      required: true,
    },
    discountPrice: {
      type: Number,
      required: true,
    },
    bathrooms: {
      type: Number,
      required: true,
    },
    bedrooms: {
      type: Number,
      required: true,
    },
    furnished: {
      type: Boolean,
      required: true,
    },
    parking: {
      type: Boolean,
      required: true,
    },
    trastero: {
      type: Boolean,
    },
    type: {
      type: String,
      required: true,
    },
    offer: {
      type: Boolean,
      required: true,
    },
    imageUrls: {
      type: Array,
      required: true,
    },
    userRef: {
      type: String,
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    // Podrías también incluir el número total de reseñas si deseas:
    reviewCount: {
      type: Number,
      default: 0,
    },

    capacidadTotal: {
      type: Number,
      default: 0,
    },

    // Añadido: campo para almacenar las referencias de las reseñas
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
      }
    ],
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
    capacity: { type: Number }, // Total de miembros permitidos

    residentesActuales: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isvisible: {
      type: Boolean,
      default: true,
    },


  },
  { timestamps: true }
);


const Listing = mongoose.model('Listing', listingSchema);

export default Listing;