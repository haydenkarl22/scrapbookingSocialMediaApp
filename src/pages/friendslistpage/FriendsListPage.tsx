import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "./friendslistpage.css";
import WebRTCManager from '../../components/webRTCManager/WebRTCManager';
import { IFriendRequestDetails, addFriend, deleteFriend, fetchFriends, searchUsers, sendFriendRequest, acceptFriendRequest, fetchFriendRequests, IFriendOperations } from '../../firebase/firebaseFriends';
import { observeAuthState } from '../../firebase/authServices';
import io from 'socket.io-client';

const socket = io('http://localhost:8080');

interface MessageData {
    message: string;
    from: string;
}

const FriendsListPage: React.FC = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [friendId, setFriendId] = useState<string>(''); 
    const [initiateChat, setInitiateChat] = useState<boolean>(false);
    const [friends, setFriends] = useState<any[]>([]);
    const [friendRequests, setFriendRequests] = useState<IFriendRequestDetails[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [messages, setMessages] = useState<string[]>([]);

    useEffect(() => {
        const unsubscribe = observeAuthState((uid) => {
            if (uid) {
                setUserId(uid);
                fetchFriends(uid).then(setFriends);
                fetchFriendRequests(uid).then(setFriendRequests);
            } else {
                setUserId(null);
                setFriends([]);
                setFriendRequests([]);
            }
        });
    
        socket.on('receiveMessage', ({ message, from }: MessageData) => {
            setMessages(prev => [...prev, `${from}: ${message}`]);
        });
    
        return () => {
            unsubscribe();
            socket.off('receiveMessage');
        };
    }, []);
    
    const handleSearch = async () => {
        if (searchTerm) {
            const results = await searchUsers(searchTerm);
            setSearchResults(results);
        }
    };
    
    const handleAddFriend = (id: string): void => {
        if (userId && id) {
            // Prevent sending a friend request if they are already friends
            const isAlreadyFriend = friends.some(friend => friend.id === id);
            if (isAlreadyFriend) {
                alert("You are already friends!");
                return;
            }
    
            // Prevent sending a friend request if there's already one pending
            const hasPendingRequest = friendRequests.some(request => request.id === id);
            if (hasPendingRequest) {
                alert("Friend request already sent!");
                return;
            }
    
            // If no friendship or pending request, proceed to send a new friend request
            const operationDetails: IFriendOperations = { userId: userId, friendId: id };
            sendFriendRequest(operationDetails);
            alert("Friend request sent!"); // Notify that a friend request was sent
        }
    };
    
    
      const handleAcceptFriendRequest = async (id: string): Promise<void> => {
        if (userId && id) {
          const username = await acceptFriendRequest({ userId, friendId: id });
          setFriendRequests(prev => prev.filter(req => req.id !== id));  // Remove from requests
          setFriends(prev => [...prev, {id: id, username: username}]);  // Add username to friends list
        }
      };
      
    
      const handleDeleteFriend = async (id: string): Promise<void> => {
        if (userId && id) {
          if (window.confirm("Are you sure you want to delete this friend?")) {
            await deleteFriend({ userId, friendId: id });
            setFriends(prev => prev.filter(friend => friend.id !== id));  // Update the friends list state
          }
        }
      };

    const handleChat = (id: string) => {
        setFriendId(id);
        setInitiateChat(true);  // Assume this user initiates the chat when clicking 'Chat'
    };

    const handleCloseChat = () => {
        setInitiateChat(false);
        setFriendId('');
    };

    const sendMessage = (message: string): void => {
        if (friendId && userId) {
            const messageData: MessageData = { message, from: userId };
            socket.emit('sendMessage', messageData); // Assuming this is the correct event name
            setMessages(prev => [...prev, `You: ${message}`]); // Appends the new message to the chat history
        }
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
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search users..."
                    />
                    <button onClick={handleSearch}>Search</button>
                    <div>
                        <h2>Search Results:</h2>
                        {searchResults.map(user => (
                            <div key={user.id} className="user-item">
                                <span>{user.username}</span>
                                <button onClick={() => handleAddFriend(user.id)}>Add Friend</button>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h2>Friend Requests:</h2>
                        {friendRequests.map(request => (
                            <div key={request.id} className="friend-request-item">
                                <span>{request.username}</span>
                                <button onClick={() => handleAcceptFriendRequest(request.id)}>Accept</button>
                            {/* Implement a decline button if needed */}
                            </div>
                        ))}
                    </div>
                    <div>
                        <h2>Friends</h2>
                        {friends.map(friend => (
                            <div key={friend.id} className="friend-item">
                                <span>{friend.username}</span>
                                <button onClick={() => handleChat(friend.id)}>Chat</button>
                                <button onClick={handleCloseChat}>End Chat</button>
                                <button onClick={() => handleDeleteFriend(friend.id)}>Delete</button>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h3>Chat with {friendId}</h3>
                        {messages.map((msg, index) => <p key={index}>{msg}</p>)}
                        <input type="text" onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.value && sendMessage(e.currentTarget.value)} placeholder="Type a message..." />
                    </div>
                    {friendId && userId ? <WebRTCManager signaling={socket} initiateChat={initiateChat} userId={userId} remoteUserId={friendId} /> : <p>Connecting...</p>}
                </div>
            </div>
        </>
    );
};

export default FriendsListPage;