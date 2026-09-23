import express from 'express';
import { getDoctors, bookAppointment, getMyAppointments, seedDoctorsRoute } from '../controllers/doctorController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/').get(getDoctors);
router.route('/appointment').post(protect, bookAppointment);
router.route('/appointments/my').get(protect, getMyAppointments);
router.route('/seed').post(seedDoctorsRoute);

export default router;
