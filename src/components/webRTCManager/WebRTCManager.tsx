import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

interface WebRTCManagerProps {
    signaling: Socket;
}

interface SignalData {
    type: string;
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
}

const WebRTCManager: React.FC<WebRTCManagerProps> = ({ signaling }) => {
    const peerConnection = useRef<RTCPeerConnection | null>(new RTCPeerConnection());
    const dataChannel = useRef<RTCDataChannel | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [inputMessage, setInputMessage] = useState('');

    useEffect(() => {
        if (!peerConnection.current) return;  // Ensure peerConnection is not null
        
        dataChannel.current = peerConnection.current.createDataChannel("chatChannel");
        dataChannel.current.onmessage = event => {
            setMessages(prevMessages => [...prevMessages, event.data]);
        };

        signaling.on('offer', async (data: SignalData) => {
            if (peerConnection.current && data.offer) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);
                signaling.emit('answer', { answer: answer });
            }
        });

        signaling.on('answer', async (data: SignalData) => {
            if (peerConnection.current && data.answer) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        });

        signaling.on('candidate', async (data: SignalData) => {
            if (peerConnection.current && data.candidate) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        });

        return () => {
            if (peerConnection.current) {
                peerConnection.current.close();
            }
            if (dataChannel.current) {
                dataChannel.current.close();
            }
        };
    }, [signaling]);

    const sendMessage = () => {
        if (dataChannel.current && dataChannel.current.readyState === "open") {
            dataChannel.current.send(inputMessage);
            setInputMessage('');
        }
    };

    return (
        <div>
            <h2>Chat</h2>
            <div>
                {messages.map((msg, index) => <p key={index}>{msg}</p>)}
            </div>
            <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default WebRTCManager;
