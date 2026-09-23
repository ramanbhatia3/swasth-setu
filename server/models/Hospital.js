import mongoose from 'mongoose';

const procedureSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String }, // e.g., "Surgery", "Dialysis", "Chemotherapy", "Consultation"
  estimatedCost: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  }
});

const hospitalSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { type: String, enum: ['Government', 'Autonomous/Govt-Aided', 'Private', 'Trust/Charitable'], required: true },
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true, index: true },
    state: { type: String, required: true, index: true },
    pincode: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  specializations: [{ type: String, index: true }], // e.g. "Cardiology", "Nephrology", "Gastroenterology"
  chronicConditionsHandled: [{ type: String, index: true }], // e.g. "Pancreatic Cancer", "Chronic Kidney Disease", "Heart Failure"
  facilities: [{ type: String }],
  procedures: [procedureSchema],
  metrics: {
    successRate: { type: Number, required: true, min: 50, max: 99 }, // e.g., 94 (%)
    successfulPatientsCount: { type: Number, required: true }, // e.g., 18500
    averageWaitTimeDays: { type: Number, default: 3 },
    nabhAccredited: { type: Boolean, default: true }
  },
  statistics: {
    beds: { type: Number },
    doctors: { type: Number }
  },
  contact: {
    phone: { type: String },
    email: { type: String },
    website: { type: String }
  },
  isVerified: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Text index for fast multi-field searching
hospitalSchema.index({
  name: 'text',
  'location.city': 'text',
  'location.state': 'text',
  specializations: 'text',
  chronicConditionsHandled: 'text'
});

export default mongoose.model('Hospital', hospitalSchema);