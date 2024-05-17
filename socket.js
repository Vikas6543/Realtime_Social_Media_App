const { Server } = require('socket.io');
const { MongoClient } = require('mongodb');

const initSocket = (server) => {
  let io = new Server(server, {
    cors: {
      methods: ['GET', 'POST'],
    },
  });

  let users = [];

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

  // app.locals.io = io;

  // Setup MongoDB change stream
  setupChangeStream(io);
};

// Setup MongoDB change stream
const setupChangeStream = async (io) => {
  const client = new MongoClient(process.env.MONGO_DATABASE_URL);
  await client.connect();

  const db = client.db('test');
  const changeStream = db.watch();

  changeStream.on('change', (change) => {
    io.emit('databaseChange', change);
  });
};

module.exports = { initSocket };
