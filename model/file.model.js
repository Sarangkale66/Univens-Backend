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
});

const File = mongoose.model('file', fileModel);

const validateFile = (data) => {
  const schema = Joi.object({
    lookingFor: Joi.string()
      .valid("Branding & Marketing",
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
      "Something else..")
      .required(),
    description: Joi.string().required(),
    file: Joi.array().items(Joi.string()).optional(), 
  });

  return schema.validate(data);
};

module.exports = {
  File,
  validateFile,
};
