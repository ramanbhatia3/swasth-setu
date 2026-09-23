import mongoose from "mongoose";

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['Government', 'Private', 'Trust'], required: true },
  location: {
    address: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  specializations: [{ type: String }],
  facilities: [{ type: String }],
  services: [{
    name: { type: String }, // e.g., "Kidney Transplant", "Dialysis"
    estimatedCost: {
      min: { type: Number },
      max: { type: Number }
    }
  }],
  statistics: {
    beds: { type: Number },
    doctors: { type: Number },
  },
  isVerified: { type: Boolean, default: false },
  contact: {
    phone: { type: String },
    website: { type: String }
  }
}, { 
  timestamps: true 
});

export default mongoose.model("Hospital", hospitalSchema);