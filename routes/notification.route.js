const express=require('express');
const router=express.Router();
const noticationController = require('../controller/notification.controller');

router.get("/",noticationController.getNotification);

module.exports = router;