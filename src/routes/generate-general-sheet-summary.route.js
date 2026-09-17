import express from 'express';
import { generalSheetSummary } from '../controllers/generate-general-sheet-summary.controller.js';

const router = express.Router();

router.get('/', generalSheetSummary);

export default router;