const express = require('express');
const router = express.Router();
const MessageModel = require('../models/messageModel');
const ConversationModel = require('../models/conversationModel');
const isAuthenticated = require('../middlewares/auth');

// Route to send a new message
router.post('/:id', isAuthenticated, async (req, res) => {
  const { textMessage } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user.id;

  try {
    let conversation = await ConversationModel.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    if (!conversation) {
      conversation = await ConversationModel.create({
        participants: [senderId, receiverId],
      });
    }

    const newMessage = new MessageModel({
      senderId,
      receiverId,
      textMessage,
    });

    if (newMessage) {
      conversation.messages.push(newMessage._id);
    }

    // this will run in parallel
    await Promise.all([conversation.save(), newMessage.save()]);

    // // SOCKET IO FUNCTIONALITY WILL GO HERE
    // const receiverSocketId = getReceiverSocketId(receiverId);
    // if (receiverSocketId) {
    //   // io.to(<socket_id>).emit() used to send events to specific client
    //   io.to(receiverSocketId).emit("newMessage", newMessage);
    // }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log('Error in sendMessage controller: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// get messages
router.get('/:id', isAuthenticated, async (req, res) => {
  const { id: userToChatId } = req.params;
  const senderId = req.user.id;

  try {
    const conversation = await ConversationModel.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate('messages');

    if (!conversation)
      return res.status(200).json({
        messages: 'No conversation found',
      });

    const messages = conversation.messages;

    res.status(200).json(messages);
  } catch (error) {
    console.log('Error in getMessages controller: ', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
