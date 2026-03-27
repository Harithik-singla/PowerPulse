const { Server } = require('socket.io');

let io;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST', 'PATCH'],
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Client joins a room by pincode so we can target alerts
    socket.on('join:pincode', (pincode) => {
      socket.join(`pincode:${pincode}`);
      console.log(`${socket.id} joined room pincode:${pincode}`);
    });

    // Operator/admin joins a global ops room
    socket.on('join:ops', () => {
      socket.join('ops');
      console.log(`${socket.id} joined ops room`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

module.exports = { initSocket, getIO };