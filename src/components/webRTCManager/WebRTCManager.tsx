import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

interface WebRTCManagerProps {
    signaling: Socket;
    initiateChat: boolean; // A prop to determine if this user should initiate the chat
    userId: string; // User ID of the current user
    remoteUserId: string;
}

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
                console.log('Preparing new WebRTC connection.');
                
                peerConnection.current.onicecandidate = event => {
                    if (event.candidate) {
                        signaling.emit('candidate', { candidate: event.candidate.toJSON(), remoteUserId });
                        console.log('ICE candidate emitted:', event.candidate);
                    }
                };
        
                peerConnection.current.ondatachannel = event => {
                    dataChannel.current = event.channel;
                    setupDataChannelHandlers();
                };
            }
        };

        const setupDataChannelHandlers = () => {
            if (dataChannel.current) {
                dataChannel.current.onopen = () => {
                    console.log("DataChannel opened");
                };
                dataChannel.current.onclose = () => {
                    console.log("DataChannel closed");
                    dataChannel.current = null;
                };
                dataChannel.current.onmessage = event => {
                    setMessages(prev => [...prev, event.data]);
                    console.log("Message received on DataChannel:", event.data);
                };
            }
        };

        // Set the user ID for this connection
        signaling.emit('setUserId', userId);
        console.log('Signaling setUserId:', userId);

        if (initiateChat) {
            prepareConnection();
            const createOffer = async () => {
              if (peerConnection.current && peerConnection.current.signalingState !== 'closed') {
                const offer = await peerConnection.current.createOffer();
                if (peerConnection.current && offer) {
                  await peerConnection.current.setLocalDescription(offer);
                  signaling.emit('offer', { offer, remoteUserId });
                }
              }
            };
            createOffer();
          }

        signaling.on('offer', async (data: SignalData) => {
            if (!initiateChat && data.from === remoteUserId) {
                prepareConnection();
                if (peerConnection.current && data.offer) {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                    console.log('Remote description set with offer:', data.offer);

                    const answer = await peerConnection.current.createAnswer();
                    if (answer) {
                        await peerConnection.current.setLocalDescription(answer);
                        signaling.emit('answer', { answer, remoteUserId: userId });
                        console.log('Answer created and emitted:', answer);
                    }
                }
            }
        });

        signaling.on('answer', async (data: SignalData) => {
            if (data.from === remoteUserId) {
                if (peerConnection.current && data.answer) {
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                    console.log('Remote description set with answer:', data.answer);
                }
            }
        });

        signaling.on('candidate', async (data: SignalData) => {
            if (data.from === remoteUserId) {
                if (peerConnection.current && data.candidate) {
                    await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                    console.log('ICE candidate added:', data.candidate);
                }
            }
        });

        return () => {
            if (peerConnection.current) {
                peerConnection.current.onicecandidate = null;
                peerConnection.current.ondatachannel = null;
                peerConnection.current.close();
                peerConnection.current = null;
            }
            if (dataChannel.current) {
                dataChannel.current.onopen = null;
                dataChannel.current.onclose = null;
                dataChannel.current.onmessage = null;
                dataChannel.current.close();
                dataChannel.current = null;
            }
            signaling.off('offer');
            signaling.off('answer');
            signaling.off('candidate');
            console.log('Cleaned up WebRTC connections.');
        };
    }, [signaling, initiateChat, userId, remoteUserId]);

    const sendMessage = () => {
        if (dataChannel.current && dataChannel.current.readyState === "open") {
            dataChannel.current.send(inputMessage);
            setInputMessage('');
            console.log('Message sent via DataChannel:', inputMessage);
        } else {
            console.log('DataChannel not open, cannot send message.');
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