const express = require('express');
const router = express.Router();
const NotificationModel = require('../models/notificationModel');
const isAuthenticated = require('../middlewares/auth');

// get notifications for a user
router.get('/', isAuthenticated, async (req, res) => {
  const receiverId = req.user.id;

  try {
    const notifications = await NotificationModel.find({
      receiverId,
    }).populate('senderId', 'name profilePicUrl');

    res.status(200).json({
      message: 'Notifications fetched successfully',
      notifications,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
