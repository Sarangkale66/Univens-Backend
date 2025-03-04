const mongoose = require('mongoose');
const Joi = require('joi');

const schema = mongoose.Schema;

const fileModel = schema({
  lookingFor: {
    type: String,
    enum: [
      "Branding & Marketing",
      "Business Strategy & Planning",
      "Customer Experience",
      "Customer Support",
      "Funding & Investment",
      "Innovation",
      "Sustainability",
      "Legal & Compliance",
      "Operations & Efficiency",
      "Product Development",
      "Risk Management",
      "Sales",
      "Growth",
      "Talent Acquisition",
      "Tech Integration",
      "Something else.."
    ],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  file: {
    type: [String], 
  },
  userId: {
    type: schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ['new', 'inProgress', 'completed'],
    required: true,
    default: 'new',
  },
}, { timestamps: true });

const File = mongoose.model('file', fileModel);

const validateFile = (data) => {
  const schema = Joi.object({
    lookingFor: Joi.string()
      .valid(
        "Branding & Marketing",
        "Business Strategy & Planning",
        "Customer Experience",
        "Customer Support",
        "Funding & Investment",
        "Innovation",
        "Sustainability",
        "Legal & Compliance",
        "Operations & Efficiency",
        "Product Development",
        "Risk Management",
        "Sales",
        "Growth",
        "Talent Acquisition",
        "Tech Integration",
        "Something else.."
      )
      .required(),
    description: Joi.string().required(),
    file: Joi.array().items(Joi.string()).optional(),
    userId: Joi.string().hex().length(24).required(), 
    status: Joi.string().valid('new', 'inProgress', 'completed').default('new'),
  });

  return schema.validate(data);
};

module.exports = {
  File,
  validateFile,
};
