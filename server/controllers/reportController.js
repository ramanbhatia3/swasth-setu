import HospitalReport from '../models/HospitalReport.js';

// Helper to generate a unique Report ID
const generateReportId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `SS-${year}-${randomNum}`;
};

// ==========================================
// CITIZEN ENDPOINTS
// ==========================================

export const submitReport = async (req, res) => {
  try {
    const { hospitalId, category, description, incidentDate } = req.body;
    const evidenceFile = req.file ? req.file.path : null;

    const report = await HospitalReport.create({
      reportId: generateReportId(),
      hospital: hospitalId,
      submittedBy: req.user._id,
      category,
      description,
      incidentDate,
      evidenceFile,
      statusHistory: [{ status: 'Submitted', changedBy: req.user._id }]
    });

    res.status(201).json({ success: true, report });
  } catch (error) {
    console.error("Report Submit Error:", error.message);
    res.status(500).json({ success: false, message: "Failed to submit report" });
  }
};

export const getMyReports = async (req, res) => {
  try {
    const reports = await HospitalReport.find({ submittedBy: req.user._id })
      .populate('hospital', 'name location')
      .sort('-createdAt');
    res.status(200).json({ success: true, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch reports" });
  }
};

// ==========================================
// GOVERNMENT ADMIN ENDPOINTS
// ==========================================

export const getAdminReports = async (req, res) => {
  try {
    const reports = await HospitalReport.find()
      .populate('hospital', 'name type')
      .populate('submittedBy', 'name email')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: reports.length, reports });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch admin reports" });
  }
};

export const updateReportStatus = async (req, res) => {
  try {
    const { status, priority, adminNote } = req.body;
    const report = await HospitalReport.findById(req.params.id);
    
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    if (status && status !== report.status) {
      report.status = status;
      report.statusHistory.push({ status, changedBy: req.user._id });
      if (status === 'Resolved' || status === 'Closed') report.resolvedAt = Date.now();
    }
    
    if (priority) report.priority = priority;
    
    if (adminNote) {
      report.adminNotes.push({ note: adminNote, addedBy: req.user._id });
    }

    await report.save();
    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update report" });
  }
};