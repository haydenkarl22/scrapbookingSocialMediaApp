import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import "./friendslistpage.css";
import WebRTCManager from '../../components/webRTCManager/WebRTCManager';
import { IFriendRequestDetails, fetchChatMessages, deleteFriend, fetchFriends, searchUsers, sendFriendRequest, acceptFriendRequest, fetchFriendRequests, IFriendOperations, sendChatMessage, fetchOutgoingFriendRequests, cancelFriendRequest } from '../../firebase/firebaseFriends';
import { observeAuthState, fetchUserProfile } from '../../firebase/authServices';
import { onSnapshot, query, collection, where, orderBy } from 'firebase/firestore';
import { db, storage } from '../../firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const FriendsListPage: React.FC = () => {
    const [userId, setUserId] = useState<string | null>(null);
    const [selectedFriend, setSelectedFriend] = useState<{ id: string; username: string } | null>(null);
    const [friends, setFriends] = useState<any[]>([]);
    const [friendRequests, setFriendRequests] = useState<IFriendRequestDetails[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [scrapbookUrl, setScrapbookUrl] = useState<string | null>(null);
    const [outgoingFriendRequests, setOutgoingFriendRequests] = useState<IFriendRequestDetails[]>([]);
    const [isChatOpen, setIsChatOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = observeAuthState((uid) => {
            if (uid) {
              setUserId(uid);
              fetchFriends(uid).then(setFriends);
              fetchFriendRequests(uid).then(setFriendRequests);
              fetchOutgoingFriendRequests(uid).then(setOutgoingFriendRequests);
              fetchUserProfile(uid).then((userProfile) => {
                if (userProfile && userProfile.scrapbookUrl) {
                  setScrapbookUrl(userProfile.scrapbookUrl);
                } else {
                  setScrapbookUrl(null);
                }
              });
            } else {
              setUserId(null);
              setFriends([]);
              setFriendRequests([]);
              setScrapbookUrl(null);
            }
          });

        return () => {
            unsubscribe();
        };
    }, []);

    useEffect(() => {
        if (selectedFriend) {
            const unsubscribe = onSnapshot(
                query(
                    collection(db, 'chatMessages'),
                    where('senderId', 'in', [userId, selectedFriend.id]),
                    where('receiverId', 'in', [userId, selectedFriend.id]),
                    orderBy('timestamp')
                ),
                (snapshot) => {
                    const messages = snapshot.docs.map((doc) => doc.data());
                    setChatMessages(messages);
                }
            );

            return () => {
                unsubscribe();
            };
        }
    }, [userId, selectedFriend]);

    const handleSearch = async () => {
        if (searchTerm) {
            const results = await searchUsers(searchTerm);
            setSearchResults(results);
        }
    };

    const handleAddFriend = async (id: string): Promise<void> => {
        if (userId && id) {
          const isAlreadyFriend = friends.some(friend => friend.id === id);
          if (isAlreadyFriend) {
            alert("You are already friends!");
            return;
          }
      
          const hasPendingRequest = friendRequests.some(request => request.id === id);
          if (hasPendingRequest) {
            alert("Friend request already sent!");
            return;
          }
      
          const operationDetails: IFriendOperations = { userId: userId, friendId: id };
          await sendFriendRequest(operationDetails);
          setOutgoingFriendRequests(prev => [...prev, { id, username: searchResults.find(user => user.id === id)?.username || "Unknown User" }]);
          alert("Friend request sent!");
        }
      };

    const handleAcceptFriendRequest = async (id: string): Promise<void> => {
        if (userId && id) {
          const friendData = await acceptFriendRequest({ userId, friendId: id });
          setFriendRequests(prev => prev.filter(req => req.id !== id));
          setFriends(prev => [...prev, friendData]);
        }
      };

    const handleDeleteFriend = async (id: string): Promise<void> => {
        if (userId && id) {
            if (window.confirm("Are you sure you want to delete this friend?")) {
                await deleteFriend({ userId, friendId: id });
                setFriends(prev => prev.filter(friend => friend.id !== id));
            }
        }
    };

    const handleChat = async (friendId: string) => {
        const friend = friends.find(friend => friend.id === friendId);
        if (friend) {
          setSelectedFriend({ id: friendId, username: friend.username });
          const messages = await fetchChatMessages(userId!, friendId);
          setChatMessages(messages);
          setIsChatOpen(true);
        }
      };

      const handleSendMessage = async (message: string, file?: File, scrapbookUrl?: string) => {
        if (userId && selectedFriend) {
          let fileUrl = '';
          if (file) {
            const storageRef = ref(storage, `chatFiles/${file.name}`);
            await uploadBytes(storageRef, file);
            fileUrl = await getDownloadURL(storageRef);
          }
          await sendChatMessage(userId, selectedFriend.id, message, fileUrl, scrapbookUrl || '');
          setChatMessages((prev) => [...prev, { senderId: userId, message, fileUrl, scrapbookUrl }]);
        }
      };

      const handleCancelFriendRequest = async (friendId: string): Promise<void> => {
        if (userId) {
          await cancelFriendRequest({ userId, friendId });
          setOutgoingFriendRequests(prev => prev.filter(req => req.id !== friendId));
        }
      };

      const handleCloseChat = () => {
        setSelectedFriend(null);
        setChatMessages([]);
        setIsChatOpen(false);
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
                <div className='search-users'>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search friends..."
                    />
                    <button onClick={handleSearch}>Search</button>
                    <div>
                        <h2>Search Results:</h2>
                        {searchResults.map(user => (
                            <div key={user.id}>
                                {user.username} <button onClick={() => handleAddFriend(user.id)}>Add Friend</button>
                            </div>
                        ))}
                    </div>
                    <div className="outgoing-friend-requests">
                        <h2>Outgoing Friend Requests:</h2>
                        {outgoingFriendRequests.map(request => (
                            <div key={request.id} className="outgoing-friend-request-item">
                                {request.username}
                                <button onClick={() => handleCancelFriendRequest(request.id)}>Cancel</button>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h2>Friend Requests:</h2>
                        {friendRequests.map(request => (
                            <div key={request.id}>
                                {request.username}
                                <button onClick={() => handleAcceptFriendRequest(request.id)}>Accept</button>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h2>Friends:</h2>
                        {friends.map(friend => (
                            <div key={friend.id}>
                                {friend.username}
                                <button onClick={() => handleChat(friend.id)}>Chat</button>
                                <button onClick={() => handleDeleteFriend(friend.id)}>Delete</button>
                            </div>
                        ))}
                    </div>
                    {isChatOpen && selectedFriend && (
                        <div>
                            <h3>Chat with {selectedFriend.username}</h3>
                                <div className='chat-messages-container'>
                                    {chatMessages.map((msg, index) => (
                                        <div key={index}>
                                            <p>{msg.senderId === userId ? 'You' : selectedFriend.username}: {msg.message}</p>
                                            {msg.fileUrl && (
                                                <div>
                                                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                                                        Download Shared File
                                                    </a>
                                                </div>
                                            )}
                                            {msg.scrapbookUrl && (
                                                <a href={msg.scrapbookUrl} target="_blank" rel="noopener noreferrer">
                                                    View Scrapbook
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>    
                                <input
                                    type="text"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && e.currentTarget.value) {
                                            handleSendMessage(e.currentTarget.value);
                                            e.currentTarget.value = '';
                                        }
                                    }}
                                        placeholder="Type a message..."
                                />
                                <input
                                    type="file"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            handleSendMessage('', e.target.files[0]);
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        if (scrapbookUrl) {
                                            handleSendMessage('', undefined, scrapbookUrl);
                                        }
                                    }}
                                    disabled={!scrapbookUrl}
                                >
                                    Share Scrapbook
                                </button>
                                <button onClick={handleCloseChat}>End Chat</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default FriendsListPage;