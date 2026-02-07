const express = require('express');
const { dailySheetSummary } = require('../controllers/dailySheetSummarizer');


const router = express.Router();


router.get('/', dailySheetSummary);


module.exports = router;