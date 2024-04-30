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

interface SignalingData {
  from: string;
  to: string;
  type: string;
  data: any;
}

io.on('connection', (socket: Socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join', (userId: string) => {
    socket.join(userId);
    console.log(`User ${userId} joined the room`);
  });

  socket.on('signaling', (data: SignalingData) => {
    const { from, to, type, data: signalingData } = data;
    console.log(`Received signaling message of type ${type} from ${from} to ${to}`);
    socket.to(to).emit('signaling', { from, type, data: signalingData });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});