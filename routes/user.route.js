const express=require('express');
const router=express.Router();
const { addTeamMember, deleteTeamMember, CreateUserResponse, sendEmail, getUsers, searchUser, deleteUser, updateUser, updateStatus, downloadUser, getTeam } = require('../controller/user.controller');

router.get("/",getUsers);
router.get("/search",searchUser);
router.get("/team", getTeam);
router.post("/sendEmail",sendEmail)
router.get("/removeMember",deleteTeamMember);
router.post("/addTeam",addTeamMember);
router.post("/create",CreateUserResponse);
router.delete("/delete/:id", deleteUser);
router.put("/update/:id?", updateUser);
router.patch("/update-status/:id", updateStatus);
router.post("/download-selected-users",downloadUser);


module.exports = router;