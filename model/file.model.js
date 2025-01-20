const mongoose = require('mongoose');
const Joi = require('joi');

const schema = mongoose.Schema;

const fileModel = schema({
  lookingFor: {
    type: String,
    enum: ['IT Services', 'HR Solutions', 'Marketing Services', 'other'],
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
    enum: ['email', 'phoneCall', 'videoCall', 'whatsApp'],
  },
});

const File = mongoose.model('file', fileModel);

const validateFile = (data) => {
  const schema = Joi.object({
    lookingFor: Joi.string()
      .valid('IT Services', 'HR Solutions', 'Marketing Services', 'other')
      .required(),
    description: Joi.string().required(),
    file: Joi.array().items(Joi.string()).optional(), 
    communicationChannel: Joi.string()
      .valid('email', 'phoneCall', 'videoCall', 'whatsApp')
      .optional(),
  });

  return schema.validate(data);
};

module.exports = {
  File,
  validateFile,
};
