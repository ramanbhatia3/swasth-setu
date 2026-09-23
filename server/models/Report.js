import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true,
    index: true
  },
  hospitalName: {
    type: String,
    required: true,
    index: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  reportedBy: {
    name: { type: String, default: 'Anonymous Citizen' },
    email: { type: String, default: 'citizen@swasthsetu.gov.in' },
    phone: { type: String, default: 'N/A' }
  },
  category: {
    type: String,
    required: true,
    enum: [
      'Cleanliness',
      'Staff Behavior',
      'Infrastructure',
      'Medicine Availability',
      'Equipment',
      'Waiting Time',
      'Emergency Services',
      'Treatment/Service Issues',
      'Billing & Overcharging',
      'Other'
    ],
    index: true
  },
  description: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium',
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Under Review', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending',
    index: true
  },
  assignedOfficer: {
    name: { type: String, default: 'Unassigned' },
    email: { type: String, default: '' },
    role: { type: String, default: 'Monitoring Officer' }
  },
  adminRemarks: {
    type: String,
    default: ''
  },
  isEscalated: {
    type: Boolean,
    default: false,
    index: true
  },
  isRepeated: {
    type: Boolean,
    default: false,
    index: true
  },
  resolutionDate: {
    type: Date
  },
  evidenceUrl: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Composite index for rapid cluster and repeated issue detection
reportSchema.index({ hospital: 1, category: 1, createdAt: -1 });

export default mongoose.model('Report', reportSchema);