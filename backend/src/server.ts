import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

interface ClientExt extends WebSocket {
    userId?: string;  // Optional property to track user ID
}

// Utility function to send a message to a specific user
const sendMessageToUser = (userId: string, message: string) => {
    wss.clients.forEach((client: ClientExt) => {
        if (client.userId === userId && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
};

wss.on('connection', (ws: ClientExt) => {
    console.log('Client connected');

    ws.on('message', (data: string) => {
        // Try to parse the incoming data
        try {
            const message = JSON.parse(data);

            // Set user ID for this connection if the message type is 'setUserId'
            if (message.type === 'setUserId') {
                ws.userId = message.userId;
                console.log(`User ID ${message.userId} set for a connection`);
            }

            // Handle sending a message to a specific user
            if (message.type === 'sendMessage' && message.to) {
                console.log(`Sending message to ${message.to}`);
                sendMessageToUser(message.to, JSON.stringify({ from: ws.userId, text: message.text }));
            }

        } catch (error) {
            console.error('Failed to parse message', error);
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
