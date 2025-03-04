const upload = require('../config/multer.config');
const express = require('express');
const router = express.Router();

const fileController = require('../controller/file.controller');

router.post('/create',upload.any(),fileController.CreateFile);
router.put('/update/:id',upload.any(),fileController.UpdateFile);
router.post('/deleteSupaFile/:id?',fileController.DeleteSupaFile);

module.exports = router;