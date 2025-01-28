const mongoose = require('mongoose');
const Joi = require('joi');

const schema = mongoose.Schema;

const fileModel = schema({
  lookingFor: {
    type: String,
    enum: ['IT Services', 'HR Solutions', 'Marketing Services', 'Other Services'],
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  file: {
    type: [String], 
  },
  communicationChannel: {
    type: String,
    enum: ['Email', 'Phone Call', 'Video Call', 'WhatsApp', 'Slack'],
  },
});

const File = mongoose.model('file', fileModel);

const validateFile = (data) => {
  const schema = Joi.object({
    lookingFor: Joi.string()
      .valid('IT Services', 'HR Solutions', 'Marketing Services', 'Other Services')
      .required(),
    description: Joi.string().required(),
    file: Joi.array().items(Joi.string()).optional(), 
    communicationChannel: Joi.string()
      .valid('Email', 'Phone Call', 'Video Call', 'WhatsApp', 'Slack')
      .optional(),
  });

  return schema.validate(data);
};

module.exports = {
  File,
  validateFile,
};
