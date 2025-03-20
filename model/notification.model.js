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
      default: null,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    receiverEmail: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ["message", "invite", "wish"],
      default: "message", 
    },
    expiresAt: { type: Date, default: null }, 
  },
  { timestamps: true } 
);

notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('notification', notificationSchema);

module.exports = Notification;
