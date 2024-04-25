import React, { useEffect, useRef, useState } from 'react';

interface WebRTCManagerProps {
    signaling: WebSocket;
}

const WebRTCManager: React.FC<WebRTCManagerProps> = ({ signaling }) => {
    const peerConnection = useRef<RTCPeerConnection | null>(new RTCPeerConnection());
    const dataChannel = useRef<RTCDataChannel | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [inputMessage, setInputMessage] = useState('');

    useEffect(() => {
        // Initialize the RTCPeerConnection
        peerConnection.current = new RTCPeerConnection();

        // Create data channel immediately upon PeerConnection creation
        dataChannel.current = peerConnection.current.createDataChannel("chatChannel");
        dataChannel.current.onmessage = event => {
            setMessages(prevMessages => [...prevMessages, event.data]);
        };
        dataChannel.current.onopen = () => {
            console.log("Data channel is open");
        };
        dataChannel.current.onclose = () => {
            console.log("Data channel is closed");
        };

        peerConnection.current.onicecandidate = event => {
            if (event.candidate) {
                signaling.send(JSON.stringify({ type: 'candidate', candidate: event.candidate }));
            }
        };

        peerConnection.current.onconnectionstatechange = () => {
            console.log(`Connection state change: ${peerConnection.current?.connectionState}`);
        };

        signaling.onmessage = async (message) => {
            if (!peerConnection.current) return;
            const data = JSON.parse(message.data);
            switch (data.type) {
                case 'offer':
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                    const answer = await peerConnection.current.createAnswer();
                    await peerConnection.current.setLocalDescription(answer);
                    signaling.send(JSON.stringify({ type: 'answer', answer }));
                    break;
                case 'answer':
                    await peerConnection.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                    break;
                case 'candidate':
                    if (data.candidate) {
                        await peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                    }
                    break;
                default:
                    break;
            }
        };

        return () => {
            if (peerConnection.current) {
                peerConnection.current.close();
            }
            if (dataChannel.current) {
                dataChannel.current.close();
            }
        };
    }, [signaling]);  // Ensure signaling is stable and not causing re-renders

    const sendMessage = () => {
        if (dataChannel.current && dataChannel.current.readyState === "open") {
            dataChannel.current.send(inputMessage);
            setInputMessage(''); // Clear input after sending
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
