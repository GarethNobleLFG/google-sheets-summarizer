const express = require('express');
const { generalSheetSummary } = require('../controllers/generalSheetSummarizer');


const router = express.Router();


router.get('/', generalSheetSummary);


module.exports = router;