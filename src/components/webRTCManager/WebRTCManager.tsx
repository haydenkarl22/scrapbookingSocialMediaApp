import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

interface WebRTCManagerProps {
    signaling: Socket;
    initiateChat: boolean;
    userId: string;
    remoteUserId: string;
}

interface SignalData {
    type: string;
    offer?: RTCSessionDescriptionInit;
    answer?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
}

const WebRTCManager: React.FC<WebRTCManagerProps> = ({ signaling, initiateChat, userId, remoteUserId }) => {
    const peerConnection = useRef<RTCPeerConnection | null>(null);
    const dataChannel = useRef<RTCDataChannel | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [inputMessage, setInputMessage] = useState('');

    useEffect(() => {
        const prepareConnection = () => {
            if (!peerConnection.current) {
                peerConnection.current = new RTCPeerConnection();
            }

            peerConnection.current.onicecandidate = event => {
                if (event.candidate) {
                    signaling.emit('signaling', { type: 'candidate', candidate: event.candidate.toJSON(), from: userId, to: remoteUserId });
                }
            };

            peerConnection.current.ondatachannel = event => {
                dataChannel.current = event.channel;
                dataChannel.current.onmessage = event => {
                    setMessages(prev => [...prev, event.data]);
                };
            };
        };

        const createDataChannel = () => {
            if (peerConnection.current && peerConnection.current.signalingState !== 'closed') {
                dataChannel.current = peerConnection.current.createDataChannel("chatChannel");
                dataChannel.current.onmessage = event => {
                    setMessages(prev => [...prev, event.data]);
                };
            }
        };

        if (initiateChat) {
            prepareConnection();
            createDataChannel();
            if (peerConnection.current && peerConnection.current.signalingState !== 'closed') {
                peerConnection.current.createOffer().then(offer => {
                    peerConnection.current?.setLocalDescription(offer);
                    signaling.emit('signaling', { type: 'offer', offer, from: userId, to: remoteUserId });
                });
            }
        }

        signaling.on('signaling', async (data: SignalData & { from: string, to: string }) => {
            if (data.from === remoteUserId) {
                switch (data.type) {
                    case 'offer':
                        if (!initiateChat && data.offer) {
                            prepareConnection();
                            await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.offer));
                            const answer = await peerConnection.current?.createAnswer();
                            await peerConnection.current?.setLocalDescription(answer);
                            signaling.emit('signaling', { type: 'answer', answer, from: userId, to: remoteUserId });
                        }
                        break;
                    case 'answer':
                        if (data.answer) {
                            await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(data.answer));
                        }
                        break;
                    case 'candidate':
                        if (data.candidate) {
                            await peerConnection.current?.addIceCandidate(new RTCIceCandidate(data.candidate));
                        }
                        break;
                }
            }
        });

        return () => {
            peerConnection.current?.close();
            dataChannel.current?.close();
        };
    }, [signaling, initiateChat, userId, remoteUserId]);

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