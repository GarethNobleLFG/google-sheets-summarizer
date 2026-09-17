import express from 'express';
import { dailySheetSummary } from '../controllers/generate-daily-sheet-summary.controller.js';

const router = express.Router();

router.get('/', dailySheetSummary);

export default router;