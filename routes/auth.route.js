const express = require('express');
const router = express.Router();
const authController = require("../controller/auth.controller");

router.get("/google",authController.GoogleController);
router.post("/signup",authController.signup);
router.post("/signin",authController.signin);
router.get("/logout",authController.logout);


module.exports = router;