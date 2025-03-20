const NotificationModel = require('../model/notification.model');

module.exports.getNotification = async(req,res,next)=>{
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    const { page = 1, limit = 10 } = req.query;

    const notifications = await NotificationModel.find({ receiverId: userId })
      .populate('senderId', 'fullname email') 
      .sort({ createdAt: -1 }) 
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    console.log(notifications);
    
    res.status(200).json({ notifications });
  } catch (err) {
    next(err);
  }
}