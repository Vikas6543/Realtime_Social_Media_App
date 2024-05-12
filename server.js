const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const cls = require('cli-color');
const path = require('path');
const { createServer } = require('http');
const server = createServer(app);

// .env configuaration
dotenv.config();

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());
mongoose.set('strictQuery', false);

// Connect to Mongo DB
const connect_DB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(cls.cyanBright('MongoDB Connected...'));
  } catch (error) {
    console.log(cls.redBright(error));
  }
};

connect_DB();

// Routes
app.use('/users', require('./routes/userRoute'));
app.use('/posts', require('./routes/postRoute'));
app.use('/chats', require('./routes/chatRoute'));
app.use('/notifications', require('./routes/notificationRoute'));

// socket io
const { initSocket } = require('./socket');
initSocket(server, app);

// deployment to render
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '/client/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// app listen
const PORT = process.env.PORT || '5000';

// Starting the server and listening on the specified port
server.listen(PORT, () => {
  console.log(`server is listening at port ${PORT}`);
});
