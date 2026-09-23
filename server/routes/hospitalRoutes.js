import express from 'express';
import { searchHospitals, seedDemoHospitals } from '../controllers/hospitalController.js';

const router = express.Router();

// Public routes (Users don't need to be logged in just to search)
router.get('/search', searchHospitals);
router.get('/seed', seedDemoHospitals); // We will hit this once via Postman/Browser to load data

export default router;