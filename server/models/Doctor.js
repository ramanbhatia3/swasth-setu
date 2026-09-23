import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  experienceYears: { type: Number, required: true },
  qualifications: { type: String, required: true },
  consultationFee: { type: Number, required: true },
  availability: [{ type: String, required: true }]
}, {
  timestamps: true
});

export default mongoose.model('Doctor', doctorSchema);
