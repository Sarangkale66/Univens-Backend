const { User, validateUser } = require('../model/user.model');
const Notification = require("../model/notification.model");
const { File } = require('../model/file.model');
const xlsx = require('xlsx');
const path = require('path');
const mail = require('../config/NodeMailer.config');

module.exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    const query = status ? { status } : {};

    const files = await File.find(query)
      .populate('userId')
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedUsers = files
      .filter(file => file.userId) 
      .map(file => ({
        _id: file.userId._id,
        fullname: file.userId.fullname || 'N/A',
        companyName: file.userId.companyName || 'N/A',
        role: file.userId.role || 'N/A',
        status: file.userId.status || 'N/A',
      }));

    const totalFiles = await File.countDocuments(query);
    const totalPages = Math.ceil(totalFiles / limit);

    res.json({ users: formattedUsers, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports.getTeam =async(req,res)=>{
  try {
    const userId = req.user._id; 

    const user = await User.findById(userId).populate('team.memberId', 'image companyName gender address phoneNumber websiteLink');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ team: user.team });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}

module.exports.deleteTeamMember = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    const { memberId, email } = req.query;

    if (!userId || (!memberId && !email)) {
      return res.status(400).json({ message: "User ID and either member ID or email are required." });
    }

    const user = await User.findById(userId, { team: 1 });
    if (!user) return res.status(404).json({ message: "User not found." });

    user.team = user.team.filter(
      (member) =>
        !(memberId && member.memberId?.toString() === memberId) &&
        !(email && member.email === email)
    );

    await user.save();

    await Notification.findOneAndDelete({
      senderId: userId,
      $or: [{ receiverId: memberId }, { receiverEmail: email }],
    });

    res.status(200).json({ message: "Team member removed successfully." });

  } catch (err) {
    next(err);
  }
};


module.exports.searchUser = async (req, res, next) => {
  try {
    const { email } = req.query;

    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: new RegExp('^' + email + '$', 'i') });

    if (!user) return res.status(200).json({ message: 'User not found' });
    
    const { password, fileIds, team, ...filteredUser } = user.toObject();
    res.status(200).json({
      message: "success",
      user: filteredUser
    });

  } catch (err) {
    next(err); 
  }
};

// Need to Check/Update as per new FrontEnd
module.exports.sendEmail = async(req,res,next)=>{
  try{
    const { email1 } = req.user;
    const { email, role, fullname } = req.body;
    context = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invitation</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333333;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
        }
        .header {
          text-align: center;
          padding: 20px 0;
          background-color: #f8f9fa;
          border-radius: 5px;
        }
        .content {
          padding: 20px 0;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          margin: 20px 0;
          background-color: #4CAF50;
          color: white !important;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          font-size: 12px;
          color: #999999;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>You're Invited!</h1>
        </div>
        <div class="content">
          <p>Hello ${fullname},</p>
          <p>You have been invited to join our platform as a <strong>${role}</strong>.</p>
          <p>This invitation was sent by ${email1}. We're excited to have you on board!</p>
          
          <p>To accept this invitation and create your account, please click the button below:</p>
          
          <div style="text-align: center;">
            <a href="https://univens.in" class="button">Join UNIVENS</a>
          </div>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact us.</p>
          
          <p>Best regards,<br>
          The Team</p>
        </div>
        <div class="footer">
          <p>If you received this email by mistake, please disregard it. No action is required.</p>
          <p>© 2025 Your Company. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;
    await mail(email, context);
    res.json({
      message:"success",
    })
    
  }catch(err){
    next(err);
  }
}


module.exports.addTeamMember = async (req, res, next) => {
  try {
    const senderId = req.user._id;
    const { fullname, email, _id, isInvited, isMember, role, message } = req.body;

    if (!fullname || !email) {
      return res.status(400).json({ message: "Fullname and email are required" });
    }

    const sender = await User.findById(senderId, { team: 1 });

    const isAlreadyMember = sender.team.some(member => member.email === email);

    if (isAlreadyMember) {
      return res.status(400).json({ message: "Member already present in the team" });
    }

    let obj = {
      senderId: senderId,
      receiverEmail: email,
      message: message,
      type: "invite",
    };

    if (isMember) obj.receiverId = _id;

    await Notification.create(obj);

    const updatedUser = await User.findByIdAndUpdate(
      senderId,
      {
        $push: {
          team: {
            memberId: _id || null,
            fullname,
            email,
            role: role || "Role Not Mentioned",
            requestType: "pending",
          },
        },
      },
      { new: true, projection: { team: 1 } }
    ).populate('team.memberId', 'image companyName gender address phoneNumber websiteLink');

    res.status(200).json({
      message: "success",
      team: updatedUser?.team || [],
    });

  } catch (err) {
    next(err);
  }
};

module.exports.CreateUserResponse = async (req, res, next) => {
  try {
    const { fullname, image, companyName, role, email, password, phoneNumber, address, websiteLink, dob, fileIds } = req.body;

    const { error } = validateUser({ fullname, image, companyName, role, email, password, phoneNumber, address, websiteLink, dob, fileIds });

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    await User.create({ fullname, image, companyName, role, email, password, phoneNumber, address, websiteLink, dob, fileIds });

    res.status(201).json({ message: "User created successfully" });

    if (!mail(email)) throw new Error("Email not sent to the user");

  } catch (err) {
    next(err); 
  }
};

module.exports.deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete user" });
  }
};

module.exports.updateUser = async (req, res, next) => {
  try {
    let id = req.params.id || req.user._id;
    let existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    let isCompleted =true;

    
    const updatedUser = await User.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    )

    if(!updatedUser.role || !updatedUser.phoneNumber || !updatedUser.dob || !updatedUser.address || !updatedUser.gender){
      isCompleted = false;
    }

    res.json({ success: true, user: updatedUser, isCompleted });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to update user" });
  }
};

// Need to Check/Update as per new FrontEnd
module.exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["new", "inProgress", "completed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Status updated successfully", user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Need to Check/Update as per new FrontEnd
module.exports.downloadUser = async (req, res, next) => {
  try {
    const { userIds } = req.body;
    if (!userIds || userIds.length === 0) {
      return res.status(400).json({ error: 'No user IDs provided.' });
    }

    let users;

    if (typeof userIds === 'string' && userIds === 'All') {
      users = await User.find().populate('fileId').lean();
    } else {
      users = await User.find({ _id: { $in: userIds } }).populate('fileId').lean();
    }

    if (!users.length) {
      return res.status(404).json({ error: 'No users found.' });
    }

    const formattedUsers = users.map(user => ({
      fullname: user.fullname,
      companyName: user.companyName,
      role: user.role,
      email: user.email,
      phoneNumber: user.phoneNumber,
      websiteLink: user.websiteLink,
      status: user.status,
      lookingFor: user.fileId?.lookingFor || 'N/A',
      fileDescription: user.fileId?.description || 'N/A',
      fileNames: user.fileId?.files?.join(', ') || 'N/A',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));

    const worksheet = xlsx.utils.json_to_sheet(formattedUsers);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'SelectedUsers');

    const publicDir = path.join(__dirname, 'public');
    if (!require('fs').existsSync(publicDir)) {
      require('fs').mkdirSync(publicDir, { recursive: true });
    }

    const filePath = path.join(publicDir, 'selected_users.xlsx');
    xlsx.writeFile(workbook, filePath);

    res.download(filePath, 'selected_users.xlsx', (err) => {
      if (err) {
        console.error('File download failed:', err);
        res.status(500).send('Failed to download file');
      }
      require('fs').unlink(filePath, (unlinkErr) => {
        if (unlinkErr) {
          console.error('Error deleting file:', unlinkErr);
        }
      });
    });
  } catch (error) {
    console.error('Error exporting selected data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
