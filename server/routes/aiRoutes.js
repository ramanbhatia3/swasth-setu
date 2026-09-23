import express from 'express';
import { chatWithAI, recommendHospital } from '../controllers/aiController.js';

const router = express.Router();

router.post('/chat', chatWithAI);
router.post('/recommend', recommendHospital);

export default router;