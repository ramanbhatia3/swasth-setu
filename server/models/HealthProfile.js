import mongoose from "mongoose";

const healthProfileSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true // One profile per user
  },
  dateOfBirth: { type: Date },
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other', 'Prefer not to say'] 
  },
  bloodGroup: { 
    type: String, 
    enum: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Unknown'],
    default: 'Unknown'
  },
  height: { type: Number }, // in cm
  weight: { type: Number }, // in kg
  allergies: [{ type: String }],
  existingConditions: [{ type: String }],
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relation: { type: String }
  }
}, { 
  timestamps: true 
});

export default mongoose.model("HealthProfile", healthProfileSchema);