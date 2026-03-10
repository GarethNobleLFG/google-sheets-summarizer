import express from 'express';
import { dailySheetSummary } from '../controllers/dailySheetSummarizer.js';

const router = express.Router();

router.get('/', dailySheetSummary);

export default router;