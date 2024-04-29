import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "./friendslistpage.css";
import WebRTCManager from '../../components/webRTCManager/WebRTCManager';  // Ensure the path is correct
import { addFriend, deleteFriend } from '../../firebase/firebaseFriends';
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

const FriendsListPage: React.FC = () => {
    const [userId, setUserId] = useState<string>('user123'); // Simulate logged-in user ID
    const [friendId, setFriendId] = useState<string>(''); // Active friend's ID to chat with or modify friendship
    const [friends, setFriends] = useState<string[]>(['user456', 'user789']); // Simulated list of friend IDs
    const [messages, setMessages] = useState<string[]>([]); // Chat messages

    useEffect(() => {
        socket.on('receiveMessage', (message: string) => {
            setMessages(prev => [...prev, message]);
        });

        // Clean up on unmount
        return () => {
            socket.off('receiveMessage');
        };
    }, []);

    const handleAddFriend = (): void => {
        addFriend({ userId, friendId });
    };
    
    const handleDeleteFriend = (): void => {
        deleteFriend({ userId, friendId });
    };

    const sendMessage = (message: string): void => {
        socket.emit('sendMessage', { message, to: friendId });
        setMessages(prev => [...prev, `You: ${message}`]);
    };

    return (
        <>
            <header className='nohead'>ScrapP@ges</header>
            <div className='buttonbar'>
                <Link to="/friends" className='friendsbutton'>Friends</Link>
                <Link to="/" className='homebutton'>Home</Link>
                <Link to="/profile" className='profilebutton'>My Profile</Link>
                <Link to="/scrapbook" className='scrapbookbutton'>Scrapbook</Link>
            </div>
            <div className='subDiv'>
                <div className='sub'>
                    <div>
                        <h2>Friends</h2>
                        {friends.map(friend => (
                            <div key={friend}>
                                <button onClick={() => setFriendId(friend)}>{friend}</button>
                            </div>
                        ))}
                        <button onClick={handleAddFriend}>Add Friend</button>
                        <button onClick={handleDeleteFriend}>Delete Friend</button>
                    </div>
                    <div>
                        <h3>Chat with {friendId}</h3>
                        {messages.map((msg, index) => <p key={index}>{msg}</p>)}
                        <input type="text" onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.value && sendMessage(e.currentTarget.value)} placeholder="Type a message..." />
                    </div>
                    { /* WebRTCManager Integration */
                        friendId ? <WebRTCManager signaling={socket} /> : <p>Connecting...</p>
                    }
                </div>
            </div>
        </>
    );
};

export default FriendsListPage;
