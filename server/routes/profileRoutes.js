import express from 'express';
import { getMyProfile, updateMyProfile } from '../controllers/profileController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Both routes are protected
router.get('/my-profile', protect, getMyProfile);
router.put('/my-profile', protect, updateMyProfile);

export default router;