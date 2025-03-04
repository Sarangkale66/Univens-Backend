const axios = require('axios');
const blacklistModel = require('../model/blacklist.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { User } = require('../model/user.model');
const { oauth2Client } = require('../utils/googleClient');

module.exports.GoogleController = async (req, res, next) => {
    const code = req.query.code;
    try {
        const googleRes = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleRes.tokens);

        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );
        
        const { email, name, picture } = userRes.data;
        let isCompleted = true;
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
            fullname: name,
            image:picture,
            companyName: "",
            role: "",
            email: email,
            password:"Google_CLIENT_USER",
            phoneNumber: "",
            websiteLink: "",
            address:"",
            dob:"",
            team: [],
            fileIds: [],
          });
        }
        
        if(!user.role || !user.phoneNumber || !user.dob || !user.address || !user.gender){
          isCompleted = false;
        }

        const { _id } = user;
        const token = jwt.sign({ _id, email },
            process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT,
        });
        res.status(200).json({
            message: 'success',
            token,
            user,
            isCompleted,
        });
    } catch (err) {
      console.log(err);
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
};

module.exports.signup= async (req,res,next) =>{
  try{
    console.log(req.body);
    const { email, password, fullName } = req.body;
    
    if(!email || !password || !fullName){
      return res.status(400).json({  message:'All fields are required' });
    }

    const isUserAlreadyExist = await User.findOne({ email });
    if(isUserAlreadyExist){
      return res.status(400).json({ message:'User already exist' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ 
      fullname:fullName, 
      email, 
      password: hashedPassword,  
    });

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET );

    res.status(201).json({ 
      token, 
      user, 
      isCompleted:false,
      message: 'User created successfully' 
    });

  }catch(err){
      next(err);
  }
};

module.exports.signin= async (req,res,next) =>{
  try{
    const {email, password}=req.body;
    if(!email || !password){
      return res.status(400).json({message:'All fields are required'});
    }
    
    const user = await User.findOne({ email });
    if(!user){
      return res.status(400).json({message:'Invalid credentials'});
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if(!isPasswordValid){
      return res.status(400).json({message:'Invalid credentials'});
    }
    let isCompleted = true;

    if(!user.role || !user.phoneNumber || !user.dob || !user.address || !user.gender){
      isCompleted = false;
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);

    res.status(200).json({ 
      token, 
      user, 
      isCompleted,
      message: 'User logged in successfully' 
    });

  }catch(err){
    next(err);
  }
}

module.exports.logout= async (req,res,next) =>{
  try{
    const { authorization } = req.headers;
    if(!authorization){
      return res.status(401).json({ message:'Unauthorized' });
    }

    const token = authorization.split(' ')[1];
    if(!token){
      return res.status(401).json({ message:'token is required' });
    }

    const isTokenBlackList = await blacklistModel.findOne({ token });
    if(isTokenBlackList){
      return res.status(400).json({ message:'Token is already blacklisted' });
    }

    await blacklistModel.create({ token });

    res.status(200).json({ message:'User logged out successfully' });
  }catch(err){
    next(err);
  }
}