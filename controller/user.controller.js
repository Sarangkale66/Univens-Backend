const { User, validateUser } = require('../model/user.model');

module.exports.CreateUserResponse = async (req, res, next) => {
  try {
    const { fullname, companyName, role, email, phoneNumber, websiteLink, fileId } = req.body;

    const { error } = validateUser({ fullname, companyName, role, email, phoneNumber, websiteLink });
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
    });

    res.status(201).json({
      message: "User created successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to create user",
      error: err.message,
    });
    next(err);
  }
};
