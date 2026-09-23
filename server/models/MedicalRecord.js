import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true,
    enum: ['Blood Tests', 'Diagnostic Tests', 'Imaging', 'Prescriptions', 'Discharge Summaries', 'Medical History', 'Other']
  },
  originalFileName: { 
    type: String, 
    required: true 
  },
  // The secure internal path on the server (never exposed to frontend)
  internalFilePath: { 
    type: String, 
    required: true 
  },
  mimeType: { 
    type: String, 
    required: true 
  },
  fileSize: { 
    type: Number, 
    required: true 
  },
  reportDate: { 
    type: Date, 
    default: Date.now 
  }
}, { 
  timestamps: true 
});

export default mongoose.model("MedicalRecord", medicalRecordSchema);