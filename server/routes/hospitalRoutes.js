import express from 'express';

import { searchHospitals, getHospitalById, compareHospitals, seedDemoHospitals, getMapData } from '../controllers/hospitalController.js';

const router = express.Router();

router.get('/search', searchHospitals);
router.post('/compare', compareHospitals); 
router.get('/seed', seedDemoHospitals); 

// --- NEW MAP ROUTE ---
router.get('/map-data', getMapData);

router.get('/:id', getHospitalById); // Keep :id at the bottom so it doesn't accidentally catch '/search' or '/seed'

export default router;