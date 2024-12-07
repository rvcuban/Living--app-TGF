import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
username :{
    type:String,
    require:true,
},
email :{
    type:String,
    require:true,
    unique:true,
},
password :{
    type:String,
    require:true,

},
phone: { type: String },
dateOfBirth: { type: Date },
address: { type: String },
gender: { type: String, enum: ['masculino', 'femenino', 'otro'] },
documentos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Document' }],
favoritos: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
rol: { type: String, enum: ['inquilino', 'propietario'], default: 'inquilino' },



avatar:{
    type:String,
    default:"https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
},
reviews: [
    { type: mongoose.Schema.Types.ObjectId, 
      ref: 'Review' }
  ],
},{timestamps: true}
);

const User = mongoose.model('User',userSchema);
export default User;  