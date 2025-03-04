const express=require('express');
const { indexControl } = require('../controller/index.controller');
const router=express.Router();

router.get("/",indexControl);

module.exports = router;