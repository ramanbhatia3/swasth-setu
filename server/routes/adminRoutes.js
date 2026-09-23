import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { requireAdmin } from '../middleware/adminMiddleware.js';
import {
  getDashboardOverview,
  getHospitalPerformanceList,
  getAllComplaints,
  updateComplaint,
  getHospitalDetailAnalytics,
  getAnalyticsData,
  getAIAdministrativeInsights,
  getAuditLogs,
  getAdminNotifications,
  getOfficersList,
  exportComplaintsCSV
} from '../controllers/adminController.js';
import { seedSampleReports } from '../seeders/reportSeeder.js';

const router = express.Router();

// Seed trigger for administrative development/testing
router.get('/seed-reports', async (req, res) => {
  await seedSampleReports();
  res.status(200).json({ success: true, message: 'Sample reports verified and seeded successfully.' });
});

// CSV Export (accessible via direct browser download / bearer auth)
router.get('/export/complaints', exportComplaintsCSV);

// Protect all following administration routes: must be logged in & role === 'admin'
router.use(protect, requireAdmin);

router.get('/overview', getDashboardOverview);
router.get('/performance', getHospitalPerformanceList);
router.get('/complaints', getAllComplaints);
router.put('/complaints/:id', updateComplaint);
router.get('/hospital/:id', getHospitalDetailAnalytics);
router.get('/analytics', getAnalyticsData);
router.get('/ai-insights', getAIAdministrativeInsights);
router.get('/audit-logs', getAuditLogs);
router.get('/notifications', getAdminNotifications);
router.get('/officers', getOfficersList);

export default router;