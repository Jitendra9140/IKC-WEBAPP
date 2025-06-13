const express = require('express');
const router = express.Router();
const { upload } = require('../config/cloudinary');
const uploadController = require('../controller/uploadController');

// Upload endpoint
router.post('/', upload.single('image'), uploadController.uploadFile);

module.exports = router;