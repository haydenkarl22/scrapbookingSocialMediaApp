import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

interface WebRTCManagerProps {
    signaling: Socket;
    initiateChat: boolean; // A prop to determine if this user should initiate the chat
    userId: string; // User ID of the current user
}

interface SignalData {
    type: string;
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
}

const WebRTCManager: React.FC<WebRTCManagerProps> = ({ signaling, initiateChat, userId }) => {
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const dataChannel = useRef<RTCDataChannel | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [inputMessage, setInputMessage] = useState('');

    useEffect(() => {
        const prepareConnection = () => {
            if (peerConnection.current) {
                dataChannel.current = peerConnection.current.createDataChannel("chatChannel");
                dataChannel.current.onmessage = (event) => {
                    setMessages(prev => [...prev, event.data]);
                };

                peerConnection.current.onicecandidate = (event) => {
                    if (event.candidate) {
                        signaling.emit('candidate', { candidate: event.candidate.toJSON() });
                    }
                };

                peerConnection.current.ondatachannel = (event) => {
                    dataChannel.current = event.channel;
                    dataChannel.current.onmessage = (event) => {
                        setMessages(prev => [...prev, event.data]);
                    };
                };
            }
        };

        // Set the user ID for this connection
        signaling.emit('setUserId', userId);

        if (initiateChat) {
            peerConnection.current = new RTCPeerConnection();
            prepareConnection();
            peerConnection.current.createOffer().then(offer => {
                if (peerConnection.current && offer) {
                    peerConnection.current.setLocalDescription(offer);
                    signaling.emit('offer', { offer });
                }
            });
        }

        signaling.on('offer', async (data: SignalData) => {
            if (!initiateChat) {
                peerConnection.current = new RTCPeerConnection();
                prepareConnection();
                if (peerConnection.current && data.offer) {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                    const answer = await peerConnection.current.createAnswer();
                    if (answer) {
                        await peerConnection.current.setLocalDescription(answer);
                        signaling.emit('answer', { answer });
                    }
                }
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

        // Listen for incoming messages
        signaling.on('receiveMessage', (data: { message: string; from: string }) => {
            setMessages(prev => [...prev, `${data.from}: ${data.message}`]);
        });

        return () => {
            peerConnection.current?.close();
            dataChannel.current?.close();
            signaling.off('offer');
            signaling.off('answer');
            signaling.off('candidate');
            signaling.off('receiveMessage');
        };
    }, [signaling, initiateChat, userId]);

    const sendMessage = () => {
        if (dataChannel.current && dataChannel.current.readyState === "open") {
            dataChannel.current.send(inputMessage);
            setInputMessage('');
        } else {
            // Send the message over the Socket.IO connection
            signaling.emit('sendMessage', { message: inputMessage, from: userId });
            setMessages(prev => [...prev, `You: ${inputMessage}`]);
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