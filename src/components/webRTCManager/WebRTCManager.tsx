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
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const dataChannel = useRef<RTCDataChannel | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [inputMessage, setInputMessage] = useState('');

    useEffect(() => {
        // Initialize the PeerConnection
        peerConnection.current = new RTCPeerConnection();

        // Create DataChannel
        dataChannel.current = peerConnection.current.createDataChannel("chatChannel");
        dataChannel.current.onmessage = event => {
            setMessages(prevMessages => [...prevMessages, event.data]);
        };

        // Setup signaling event listeners
        const handleOffer = async (data: SignalData) => {
            if (data.offer && peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);
                signaling.emit('answer', { answer });
            }
        };

        const handleAnswer = async (data: SignalData) => {
            if (data.answer && peerConnection.current) {
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            }
        };

        const handleCandidate = async (data: SignalData) => {
            if (data.candidate && peerConnection.current) {
                await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        };

        signaling.on('offer', handleOffer);
        signaling.on('answer', handleAnswer);
        signaling.on('candidate', handleCandidate);

        return () => {
            if (peerConnection.current) {
                peerConnection.current.close();
            }
            if (dataChannel.current) {
                dataChannel.current.close();
            }
            // Remove event listeners to prevent memory leaks
            signaling.off('offer', handleOffer);
            signaling.off('answer', handleAnswer);
            signaling.off('candidate', handleCandidate);
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
