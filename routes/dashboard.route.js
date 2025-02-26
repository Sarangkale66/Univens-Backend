const express = require('express');
const router = express.Router();
const { User } = require('../model/user.model');

router.get("/",(req,res)=>{
  res.render('dashboard.ejs');
});

router.get("/read/:id",async (req,res)=>{
  try {
    const user = await User.findById(req.params.id).populate('fileId');

    if (!user) {
        return res.status(404).send('User not found');
    }

    res.render('readFile.ejs', { user });
  } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).send('Internal Server Error');
  }
});

module.exports = router;