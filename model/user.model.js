const mongoose = require('mongoose');
const schema = mongoose.Schema;
const Joi = require('joi');

const userModel = schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    companyName: {
      type: String,
      required: true,
      maxLength: 100,
    },
    role: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      maxLength: 150,
    },
    phoneNumber: {
      type: String, 
      required: true,
      trim: true,
    },
    websiteLink: {
      type: String,
      trim: true,
    },
    fileId: {
      type: schema.Types.ObjectId, 
      ref: 'file',
    },
  },
  { timestamps: true } 
);

const validateUser = (data) => {
  const schema = Joi.object({
    fullname: Joi.string().max(100).trim().required(),
    companyName: Joi.string().max(100).trim().required(),
    role: Joi.string().trim().required(),
    email: Joi.string().email().max(150).required(),
    phoneNumber: Joi.string()
      .pattern(/^\+?[0-9\s-]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Phone number must be valid',
      }),
    websiteLink: Joi.string().uri().optional(),
  });

  return schema.validate(data);
};

const User = mongoose.model('User', userModel);

module.exports = {
  User,
  validateUser,
};