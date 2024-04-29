import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

interface WebRTCManagerProps {
    signaling: Socket;
    initiateChat: boolean; // A prop to determine if this user should initiate the chat
}

interface SignalData {
    type: string;
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
}

const WebRTCManager: React.FC<WebRTCManagerProps> = ({ signaling, initiateChat }) => {
    const peerConnection = useRef<RTCPeerConnection | null>(new RTCPeerConnection());
    const dataChannel = useRef<RTCDataChannel | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [inputMessage, setInputMessage] = useState('');

    useEffect(() => {
        if (!peerConnection.current) {
            return; // Exit early if peerConnection isn't initialized
        }
        
        const prepareConnection = () => {
            if (!peerConnection.current) {
                return; // Ensure peerConnection is still valid
            }

            dataChannel.current = peerConnection.current.createDataChannel("chatChannel");
            dataChannel.current.onmessage = event => {
                setMessages(prev => [...prev, event.data]);
            };

            peerConnection.current.onicecandidate = event => {
                if (event.candidate) {
                    signaling.emit('candidate', { candidate: event.candidate.toJSON() });
                }
            };

            peerConnection.current.ondatachannel = event => {
                dataChannel.current = event.channel;
                dataChannel.current.onmessage = event => {
                    setMessages(prev => [...prev, event.data]);
                };
            };
        };

        if (initiateChat) {
            prepareConnection();
            peerConnection.current.createOffer().then(offer => {
                if (!peerConnection.current) {
                    return; // Ensure peerConnection is still valid
                }
                peerConnection.current.setLocalDescription(offer);
                signaling.emit('offer', { offer });
            }).catch(e => console.error("Error creating offer: ", e));
        }

        signaling.on('offer', async (data: SignalData) => {
            if (!initiateChat && peerConnection.current && data.offer) {
                prepareConnection();
                await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                const answer = await peerConnection.current.createAnswer();
                await peerConnection.current.setLocalDescription(answer);
                signaling.emit('answer', { answer });
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
            signaling.off('offer');
            signaling.off('answer');
            signaling.off('candidate');
        };
    }, [signaling, initiateChat]);

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
