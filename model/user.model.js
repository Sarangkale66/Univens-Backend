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
    image: {
      type: String,
      trim: true,
    },
    companyName: {
      type: String,
      maxLength: 100,
      trim: true,
    },
    role: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      maxLength: 150,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    websiteLink: {
      type: String,
      trim: true,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    team: [
      {
        _id: false, 
        memberId: {
          type: schema.Types.ObjectId,
          ref:"user",
        },
        fullname: {
          type: String,
          required: true,
          trim: true,
        },
        email: {
          type: String,
          required: true,
          lowercase: true,
          trim: true,
        },
        role:{
          type:String,
          required:true,
          trim: true,
        },
        isMember: {
          type: Boolean,
          required: true,
        },
      },
    ],
    fileIds: [
      {
        type: schema.Types.ObjectId,
        ref: 'file',
      },
    ],
  },
  { timestamps: true }
);

const validateUser = (data) => {
  const schema = Joi.object({
    fullname: Joi.string().max(100).trim().required(),
    image: Joi.string().uri().optional(),
    companyName: Joi.string().max(100).trim().optional(),
    role: Joi.string().trim().optional(),
    email: Joi.string().email().max(150).trim().required(),
    password: Joi.string()
      .min(6)
      .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{6,}$'))
      .messages({
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter, and one number.',
      })
      .trim()
      .required(),
    phoneNumber: Joi.string()
      .pattern(/^\+?[0-9\s-]+$/)
      .trim()
      .messages({
        'string.pattern.base': 'Phone number must be valid',
      })
      .optional(),
    address: Joi.string().trim().optional(),
    websiteLink: Joi.string().uri().trim().optional(),
    dob: Joi.date().optional(),
    gender: Joi.string().valid('male', 'female', 'other').optional(),
    team: Joi.array()
      .max(5) 
      .items(
        Joi.object({
          memberId: Joi.string().hex().length(24).optional(),
          fullname: Joi.string().max(100).trim().required(),
          email: Joi.string().email().trim().required(),
          role: Joi.string().trim().required(),
          isMember: Joi.boolean().required(),
        })
      )
      .optional(),
    fileIds: Joi.array().items(Joi.string().hex().length(24)).optional(),
  });

  return schema.validate(data);
};

const User = mongoose.model('user', userModel);

module.exports = {
  User,
  validateUser,
};
