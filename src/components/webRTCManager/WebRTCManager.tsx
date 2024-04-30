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
      const createPeerConnection = () => {
        peerConnection.current = new RTCPeerConnection();
        console.log('Created new peer connection');
  
        peerConnection.current.onicecandidate = (event) => {
          if (event.candidate) {
            signaling.emit('signaling', {
              from: userId,
              to: remoteUserId,
              type: 'candidate',
              data: event.candidate,
            });
          }
        };
  
        peerConnection.current.ondatachannel = (event) => {
          dataChannel.current = event.channel;
          setupDataChannelHandlers();
        };
      };
  
      const setupDataChannelHandlers = () => {
        if (dataChannel.current) {
          dataChannel.current.onopen = () => {
            console.log('Data channel opened');
          };
  
          dataChannel.current.onclose = () => {
            console.log('Data channel closed');
          };
  
          dataChannel.current.onmessage = (event) => {
            console.log('Received message:', event.data);
            setMessages((prevMessages) => [...prevMessages, event.data]);
          };
        }
      };
  
      const handleSignalingMessage = async (data: any) => {
        const { from, type, data: signalingData } = data;
  
        if (from === remoteUserId) {
          switch (type) {
            case 'offer':
              console.log('Received offer:', signalingData);
              createPeerConnection();
              await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(signalingData));
              const answer = await peerConnection.current?.createAnswer();
              await peerConnection.current?.setLocalDescription(answer);
              signaling.emit('signaling', {
                from: userId,
                to: remoteUserId,
                type: 'answer',
                data: answer,
              });
              break;
            case 'answer':
              console.log('Received answer:', signalingData);
              await peerConnection.current?.setRemoteDescription(new RTCSessionDescription(signalingData));
              break;
            case 'candidate':
              console.log('Received ICE candidate:', signalingData);
              await peerConnection.current?.addIceCandidate(new RTCIceCandidate(signalingData));
              break;
            default:
              break;
          }
        }
      };
  
      signaling.emit('join', userId);
  
      signaling.on('signaling', handleSignalingMessage);
  
      if (initiateChat) {
        createPeerConnection();
        const channel = peerConnection.current?.createDataChannel('chat');
        if (channel) {
          dataChannel.current = channel;
          setupDataChannelHandlers();
        }
  
        const createOffer = async () => {
          const offer = await peerConnection.current?.createOffer();
          await peerConnection.current?.setLocalDescription(offer);
          signaling.emit('signaling', {
            from: userId,
            to: remoteUserId,
            type: 'offer',
            data: offer,
          });
        };
  
        createOffer();
      }
  
      return () => {
        signaling.off('signaling', handleSignalingMessage);
        peerConnection.current?.close();
      };
    }, [signaling, initiateChat, userId, remoteUserId]);
  
    const sendMessage = () => {
      if (dataChannel.current && dataChannel.current.readyState === 'open') {
        dataChannel.current.send(inputMessage);
        setInputMessage('');
      }
    };
  
    return (
      <div>
        <h2>Chat</h2>
        <div>
          {messages.map((msg, index) => (
            <p key={index}>{msg}</p>
          ))}
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