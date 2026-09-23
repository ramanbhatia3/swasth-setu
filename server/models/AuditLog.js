import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  adminName: {
    type: String,
    required: true
  },
  adminEmail: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: ['STATUS_CHANGE', 'OFFICER_ASSIGNED', 'REMARKS_UPDATED', 'REPORT_ESCALATED', 'HOSPITAL_FLAGGED']
  },
  reportId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    required: false
  },
  hospitalName: {
    type: String,
    required: true
  },
  previousValue: {
    type: String,
    default: ''
  },
  newValue: {
    type: String,
    default: ''
  },
  details: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

export default mongoose.model('AuditLog', auditLogSchema);