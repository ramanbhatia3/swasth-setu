import express from 'express';
import { uploadRecord, getMyRecords, viewSecureFile } from '../controllers/recordController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../utils/uploadConfig.js';

const router = express.Router();

// All routes require the user to be logged in
router.post('/upload', protect, upload.single('file'), uploadRecord);
router.get('/my-records', protect, getMyRecords);
router.get('/secure-view/:id', protect, viewSecureFile);

export default router;