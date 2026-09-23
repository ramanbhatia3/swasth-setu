import express from 'express';
import { submitReport, getMyReports, getAdminReports, updateReportStatus } from '../controllers/reportController.js';
import { protect, admin } from '../middleware/authMiddleware.js';
import { uploadEvidence } from '../utils/evidenceUploadConfig.js';

const router = express.Router();

// Citizen Routes
router.post('/', protect, uploadEvidence.single('evidence'), submitReport);
router.get('/my-reports', protect, getMyReports);

// Government Admin Routes
router.get('/admin/all', protect, admin, getAdminReports);
router.patch('/admin/:id', protect, admin, updateReportStatus);

export default router;