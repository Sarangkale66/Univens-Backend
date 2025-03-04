const mongoose = require('mongoose');
const schema = mongoose.Schema;

const notificationSchema = new schema(
  {
    senderId: {
      type: schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    receiverId: {
      type: schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 7 * 24 * 60 * 60, 
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('notification', notificationSchema);

module.exports = Notification;
