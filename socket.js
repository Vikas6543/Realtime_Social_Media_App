const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');

let users = [];

const initSocket = (server, app) => {
  let io = new Server(server, {
    cors: {
      methods: ['GET', 'POST'],
    },
  });

  // socket connection
  io.on('connection', (socket) => {
    const { userId } = socket.handshake.query;

    const existingUser = users.find((user) => user.userId === userId);

    if (!existingUser) {
      users.push({ userId, socketId: socket.id });
    }

    // io.emit() is used to send events to all the connected clients
    io.emit(
      'getOnlineUsers',
      users.map((user) => {
        const { socketId, ...rest } = user;
        return rest;
      })
    );

    socket.on('typing', (receiverId) => {
      const user = users.find((user) => user.userId === receiverId);
      if (user) {
        io.to(user.socketId).emit('typing', userId); // Emit typing event to receiver
      }
    });

    socket.on('stopTyping', (receiverId) => {
      // Receive receiverId from client
      const user = users.find((user) => user.userId === receiverId);
      if (user) {
        io.to(user.socketId).emit('stopTyping', userId); // Emit stopTyping event to receiver
      }
    });

    socket.on('sendMessage', (data) => {
      const user = users.find((user) => user.userId === data?.receiverId);
      if (user) {
        io.to(user.socketId).emit('getMessage', data);
      }
    });

    socket.on('sendLikedNotification', (data) => {
      const user = users.find((user) => user.userId === data?.receiverId);
      if (user) {
        io.to(user.socketId).emit('getLikedNotification', data);
      }
    });

    socket.on('disconnect', () => {
      users = users.filter((user) => user.socketId !== socket.id);
      io.emit('getOnlineUsers', users);
    });
  });

  app.locals.io = io;

  // Call the function to setup the change stream
  // setupChangeStream(io);
};

// Setup MongoDB change stream
const setupChangeStream = async (io) => {
  try {
    const client = new MongoClient(process.env.MONGO_URL);
    await client.connect();

    const database = client.db('test');
    const collection = database.collection('users');

    const changeStream = collection.watch();

    // Listen for changes in the collection
    changeStream.on('change', (change) => {
      // Emit event to connected clients when a change occurs
      io.emit('databaseChange', change);
    });
  } catch (error) {
    console.error('Error setting up change stream:', error);
  }
};

module.exports = { initSocket, users };
