import express from 'express';
import { chatWithAI } from '../controllers/aiController.js';

const router = express.Router();

// Public route: Anyone can ask the AI a question
router.post('/chat', chatWithAI);

export default router;