import express from 'express';
import { generateContent, chat, analyzeSentiment, extractInformation, summarize } from './ai.controller.js';
import { requireAuth } from '../../middlewares/requireAuth.middleware.js';

const router = express.Router();

// Middleware to require authentication for all AI routes
router.use(requireAuth);

// AI Routes
router.post('/generate', generateContent);
router.post('/chat', chat);
router.post('/analyze-sentiment', analyzeSentiment);
router.post('/extract-info', extractInformation);
router.post('/summarize', summarize);

export const aiRoutes = router;
