import express from 'express';
import { generalSheetSummary } from '../controllers/generalSheetSummarizer.js';

const router = express.Router();

router.get('/', generalSheetSummary);

export default router;