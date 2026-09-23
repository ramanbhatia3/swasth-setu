import mongoose from "mongoose";

const hospitalReportSchema = new mongoose.Schema({
  reportId: { type: String, required: true, unique: true }, // e.g., SS-2026-000184
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital', required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  category: { type: String, required: true },
  description: { type: String, required: true, maxLength: 2000 },
  incidentDate: { type: Date },
  evidenceFile: { type: String }, // Internal secure path
  
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Critical'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Submitted', 'Pending', 'In Progress', 'Resolved', 'Rejected', 'Closed'], 
    default: 'Submitted' 
  },
  
  adminNotes: [{
    note: String,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }],
  statusHistory: [{
    status: String,
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, default: Date.now }
  }],
  
  resolvedAt: { type: Date }
}, { 
  timestamps: true 
});

export default mongoose.model("HospitalReport", hospitalReportSchema);