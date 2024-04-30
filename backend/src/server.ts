import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

interface ClientExt extends WebSocket {
    userId?: string; // Optional property to track user ID
}

interface MessageData {
    type: 'sendMessage';
    text: string;
    from: string;
}

wss.on('connection', (ws: ClientExt) => {
    console.log('Client connected');

    ws.on('message', (data: string) => {
        try {
            const message: MessageData = JSON.parse(data);

            // Use a type assertion to assert that message.type is a string
            const type = message.type as string;

            // Set user ID for this connection if the message type is 'setUserId'
            if (type === 'setUserId') {
                ws.userId = message.from;
                console.log(`User ID ${message.from} set for a connection`);
            }

            
            // Handle sending a message to all connected clients
            if (type === 'sendMessage') {
                const broadcastMessage: MessageData = {
                    type: 'sendMessage',
                    text: message.text,
                    from: ws.userId || 'Unknown', // Include the sender's user ID
                };

                wss.clients.forEach((client: ClientExt) => {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(broadcastMessage));
                    }
                });
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