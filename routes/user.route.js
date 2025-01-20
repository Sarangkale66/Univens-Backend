const express=require('express');
const router=express.Router();
const { CreateUserResponse } = require('../controller/user.controller');

router.post("/create",CreateUserResponse);

module.exports = router;