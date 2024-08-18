import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { connect } from './config.js';
import { chatModel } from './model/chat.schema.js';

const app = express();
app.use(cors());

const connectedUsers = []; // Array of { username, imageUrl } objects

// Serve static files from the public directory
app.use(express.static(path.join(path.resolve(), 'public')));

// create server using http
const server = createServer(app);

// Create socket server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', (data) => {
    socket.username = data.username;
    socket.imageUrl = data.imageUrl;
    // send old messages to the client
    chatModel
      .find()
      .sort({ timeStamp: 1 })
      .limit(50)
      .then((messages) => {
        messages.forEach((message) => {
          if (message.username === data.username) {
            socket.imageUrl = message.imageUrl;
            return;
          }
        });
        connectedUsers.push({
          username: socket.username,
          imageUrl: socket.imageUrl,
        });
        socket.emit('load_users', connectedUsers);
        socket.emit('load_messages', messages);

        socket.broadcast.emit('load_users', [
          {
            username: socket.username,
            imageUrl: socket.imageUrl,
          },
        ]);
        socket.broadcast.emit(
          'broadcast_message',
          `${data.username} joined the group`
        );
      })
      .catch((err) => {
        console.log(err);
      });
  });

  // Handling chat messages
  socket.on('new_message', async (message) => {
    try {
      const date = new Date();
      let userMessage = {
        username: socket.username,
        imageUrl: socket.imageUrl,
        message: message,
        timestamp: date,
      };

      // Store the data in DB
      const newChat = new chatModel({
        username: socket.username,
        message: message,
        imageUrl: socket.imageUrl,
        timestamp: date,
      });
      newChat.save();

      // broadcast this message to all the clients
      socket.broadcast.emit('broadcast_message', userMessage);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  // Handling user disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    // Remove the disconnected user from the list of connected users
    const index = connectedUsers.findIndex(
      (user) => user.username === socket.username
    );
    if (index !== -1) {
      socket.broadcast.emit('broadcast_message', connectedUsers[index]);
      connectedUsers.splice(index, 1);
    }
    socket.broadcast.emit('broadcast_message', `${socket.username} has left`);
  });
});

// Express routes
app.get('/', (req, res) => {
  res.sendFile(path.join(path.resolve(), 'public', 'index.html'));
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
  connect();
});
