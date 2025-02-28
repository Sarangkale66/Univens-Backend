const { User, validateUser } = require('../model/user.model');
<<<<<<< HEAD
=======
const xlsx = require('xlsx');
const path = require('path');
>>>>>>> main
const mail=require('../config/NodeMailer.config');

module.exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const status = req.query.status; 
    const skip = (page - 1) * limit;

    const query = status ? { status } : {}; 

    const users = await User.find(query)
      .sort({ _id: -1 }) 
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({ users, totalPages, currentPage: page });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports.CreateUserResponse = async (req, res, next) => {
  try {
    const { fullname, companyName, role, email, phoneNumber, websiteLink, fileId } = req.body; 
    
    const { error } = validateUser({ fullname, companyName, role, email, phoneNumber, websiteLink, status: "new" });
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    await User.create({
      fullname,
      companyName,
      role,
      email,
      phoneNumber,
      websiteLink,
      fileId,
      status: "new",
    });

    res.status(201).json({
      message: "User created successfully",
    });

    if(!mail(email)) throw new Error("Email not send to the user");
  } catch (err) {
    res.status(500).json({
      message: "Failed to create user",
      error: err.message,
    });
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
}

module.exports.updateUser = async (req, res, next) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, user: updatedUser });
  } catch (error) {
      res.status(500).json({ success: false, error: "Failed to update user" });
  }
}

module.exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!["new", "inProgress", "completed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status value" });
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
    );

    if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Status updated successfully", user: updatedUser });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports.downloadUser = async (req, res, next) => {
  try {
      const { userIds } = req.body;
      if (!userIds || userIds.length === 0) {
          return res.status(400).json({ error: 'No user IDs provided.' });
      }

      let users;

      if(typeof(userIds)==='string' && userIds==='All'){
        users = await User.find().populate('fileId').lean();
      }else{
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
          fileNames: user.fileId?.file?.join(', ') || 'N/A',
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
