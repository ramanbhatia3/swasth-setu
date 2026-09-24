import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import { uploadRecord, getMyRecords, viewSecureFile } from '../controllers/recordController.js';
import { protect } from '../middleware/authMiddleware.js';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'swasth_setu_records',
    resource_type: 'auto',
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

// All routes require the user to be logged in
router.post('/upload', protect, upload.single('file'), uploadRecord);
router.get('/my-records', protect, getMyRecords);
router.get('/secure-view/:id', protect, viewSecureFile);

export default router;