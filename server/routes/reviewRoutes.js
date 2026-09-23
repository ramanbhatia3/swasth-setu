import express from 'express';
import { addReview, getHospitalReviews } from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public: Anyone can see reviews for a hospital
router.get('/:hospitalId', getHospitalReviews);

// Protected: Only logged-in users can submit a review
router.post('/', protect, addReview);

export default router;