const express = require('express');
const carparkController = require('../controllers/carparkController');

const router = express.Router();

// Route to get all carpark availabilities
router.get('/availability', carparkController.getCarparkAvailability);

// Route to get specific carpark details
router.get('/details/:code', carparkController.getCarparkDetails);

module.exports = router;