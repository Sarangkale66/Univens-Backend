const { User } = require('../model/user.model');
const blacklistModel = require('../model/blacklist.model');
const jwt = require('jsonwebtoken');

module.exports.isAuthenticated = async (req, res, next) => {
  try{
    const token = req.headers.authorization?.split(" ")[1];
    if(!token){
      return res.status(401).json({ message:'Unauthorized' });
    }
    
    const isBlacklisted = await blacklistModel.findOne({ token });
    if(isBlacklisted){
      return res.status(401).json({ message:'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);  
    if(!user){
      return res.status(401).json({ message:'Unauthorized' });
    }
    req.user = user;
    next();
  }catch(err){
    next(err);
  }
}

module.exports.isAdmin = async (req, res, next) => {
  try{
    if(req.user.role !== 'Official_Univens_Admin_123'){
      return res.status(401).json({ message:'Unauthorized' });
    }
    next();
  }catch(err){
    next(err);
  }
}

