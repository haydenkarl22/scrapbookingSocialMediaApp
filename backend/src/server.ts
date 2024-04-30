import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Replace with your client-side URL
    methods: ['GET', 'POST'],
  },
});

interface SignalData {
  type: string;
  offer?: RTCSessionDescriptionInit & { remoteUserId?: string };
  answer?: RTCSessionDescriptionInit & { remoteUserId?: string };
  candidate?: RTCIceCandidateInit & { remoteUserId?: string };
  from?: string;
}

interface MessageData {
  message: string;
  from: string;
  to: string;
}

const userSockets = new Map<string, Socket>();

io.on('connection', (socket: Socket) => {
  console.log('Client connected:', socket.id);

  socket.on('setUserId', (userId: string) => {
    userSockets.set(userId, socket);
    console.log('User ID set:', userId);
  });

  socket.on('offer', (data: SignalData) => {
    const { from, offer } = data;
    const remoteUserId = offer?.remoteUserId;
    const remoteSocket = remoteUserId ? userSockets.get(remoteUserId) : undefined;
    if (remoteSocket) {
      remoteSocket.emit('offer', { ...data, from });
    }
  });

  socket.on('answer', (data: SignalData) => {
    const { from, answer } = data;
    const remoteUserId = answer?.remoteUserId;
    const remoteSocket = remoteUserId ? userSockets.get(remoteUserId) : undefined;
    if (remoteSocket) {
      remoteSocket.emit('answer', { ...data, from });
    }
  });

  socket.on('candidate', (data: SignalData) => {
    const { from, candidate } = data;
    const remoteUserId = candidate?.remoteUserId;
    const remoteSocket = remoteUserId ? userSockets.get(remoteUserId) : undefined;
    if (remoteSocket) {
      remoteSocket.emit('candidate', { ...data, from });
    }
  });

  socket.on('sendMessage', (data: MessageData) => {
    const { to } = data;
    const remoteSocket = userSockets.get(to);
    if (remoteSocket) {
      remoteSocket.emit('receiveMessage', data);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    // Remove the socket from the userSockets map
    for (const [userId, userSocket] of userSockets.entries()) {
      if (userSocket === socket) {
        userSockets.delete(userId);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});